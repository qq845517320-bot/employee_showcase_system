import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { 
  getAllDepartments, 
  getEmployeesByDepartment, 
  getEmployeeById,
  getActiveEmployees,
  getCoreEmployees,
  getHonorsByEmployeeId,
  getNewHonors,
  getEmployeesWithNewHonors,
  getActivePlaybackStrategy,
  getAllPlaybackStrategies,
  getDepartmentById,
  getActiveBackground,
  getAllBackgrounds,
  getAllHonorCategories,
  createHonorCategory,
  deleteHonorCategory,
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyPhotos,
  createCompanyPhoto,
  deleteCompanyPhoto,
  getAllCompanyPhotos
} from "./db";
import { departments, employees, honors, playbackStrategies, showcaseBackgrounds, honorCategories, companies } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

// ========== 公司路由 ==========
const companyRouter = router({
  list: publicProcedure.query(async () => {
    return getAllCompanies();
  }),
  
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getCompanyById(input.id);
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const result = await createCompany(input.name, input.description);
      return result;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const { id, name, description } = input;
      const result = await updateCompany(id, name, description);
      return result;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const result = await deleteCompany(input.id);
      return result;
    }),
  
  getPhotos: publicProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      return getCompanyPhotos(input.companyId);
    }),
  
  getAllPhotos: publicProcedure
    .query(async () => {
      return getAllCompanyPhotos();
    }),
  
  uploadPhoto: protectedProcedure
    .input(z.object({
      companyId: z.number(),
      fileData: z.string(),
      fileName: z.string(),
      title: z.string(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      
      try {
        const buffer = Buffer.from(input.fileData, 'base64');
        const ext = input.fileName.split('.').pop() || 'jpg';
        const fileKey = `company-photos/${input.companyId}/${nanoid()}.${ext}`;
        
        const { url } = await storagePut(fileKey, buffer, `image/${ext}`);
        
        await createCompanyPhoto(input.companyId, url, input.title, input.subtitle, input.description);
        return { success: true, photoUrl: url };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to upload photo: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),
  
  deletePhoto: protectedProcedure
    .input(z.object({ photoId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      
      try {
        console.log(`[API] deletePhoto called with photoId: ${input.photoId}`);
        const result = await deleteCompanyPhoto(input.photoId);
        console.log(`[API] deletePhoto result:`, result);
        
        if (!result.success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: result.error || 'Failed to delete photo',
          });
        }
        
        return result;
      } catch (error) {
        console.error(`[API] deletePhoto error:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to delete photo: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),
});

// ========== 部门路由 ==========
const departmentRouter = router({
  list: publicProcedure.query(async () => {
    return getAllDepartments();
  }),
  
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getDepartmentById(input.id);
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      order: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const result = await db.insert(departments).values({
        name: input.name,
        description: input.description,
        order: input.order || 0,
      });
      return result;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      order: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const { id, ...updates } = input;
      const result = await db.update(departments).set(updates).where(eq(departments.id, id));
      return result;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const result = await db.delete(departments).where(eq(departments.id, input.id));
      return result;
    }),
});

// ========== 员工路由 ==========
const employeeRouter = router({
  list: publicProcedure
    .input(z.object({
      departmentId: z.number().optional(),
      displayMode: z.enum(['all', 'core_bones']).optional(),
    }))
    .query(async ({ input }) => {
      if (input.displayMode === 'core_bones') {
        return getCoreEmployees();
      } else if (input.departmentId) {
        return getEmployeesByDepartment(input.departmentId);
      } else {
        return getActiveEmployees();
      }
    }),
  
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const employee = await getEmployeeById(input.id);
      if (!employee) return null;
      
      const honors_list = await getHonorsByEmployeeId(input.id);
      return {
        ...employee,
        honors: honors_list,
      };
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      departmentId: z.number(),
      position: z.string().min(1),
      level: z.string().min(1),
      joinDate: z.date(),
      systemJoinDate: z.date().optional(),
      jobResponsibilities: z.string().optional(),
      workTenet: z.string().optional(),
      workPhoto: z.string().optional(),
      isCoreBone: z.boolean().optional(),
      isPartyMember: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const result = await db.insert(employees).values({
        name: input.name,
        departmentId: input.departmentId,
        position: input.position,
        level: input.level,
        joinDate: input.joinDate,
        systemJoinDate: input.systemJoinDate,
        jobResponsibilities: input.jobResponsibilities,
        workTenet: input.workTenet,
        workPhoto: input.workPhoto,
        isCoreBone: input.isCoreBone || false,
        isPartyMember: input.isPartyMember || false,
      });
      return result;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      departmentId: z.number().optional(),
      position: z.string().optional(),
      level: z.string().optional(),
      joinDate: z.date().optional(),
      systemJoinDate: z.date().optional().nullable(),
      jobResponsibilities: z.string().optional(),
      workTenet: z.string().optional(),
      workPhoto: z.string().optional(),
      status: z.enum(['active', 'inactive', 'archived']).optional(),
      isCoreBone: z.boolean().optional(),
      isPartyMember: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const { id, ...updates } = input;
      const result = await db.update(employees).set(updates).where(eq(employees.id, id));
      return result;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const result = await db.update(employees).set({ status: 'archived' }).where(eq(employees.id, input.id));
      return result;
    }),
  
  uploadPhoto: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      fileBuffer: z.instanceof(Buffer),
      fileName: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      
      const fileKey = `employees/${input.employeeId}-${nanoid()}-${input.fileName}`;
      const { url } = await storagePut(fileKey, input.fileBuffer, 'image/jpeg');
      
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      await db.update(employees).set({ workPhoto: url }).where(eq(employees.id, input.employeeId));
      return { url };
    }),
  
  import: protectedProcedure
    .input(z.object({
      employees: z.array(z.object({
        name: z.string().min(1),
        departmentName: z.string().min(1),
        position: z.string().min(1),
        level: z.string().min(1),
        joinDate: z.string(),
        jobResponsibilities: z.string().optional(),
        workTenet: z.string().optional(),
        photoUrl: z.string().optional(),
      }))
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'UNAUTHORIZED' });
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      
      const allDepartments = await getAllDepartments();
      const deptMap = new Map(allDepartments.map(d => [d.name, d.id]));
      
      for (const emp of input.employees) {
        try {
          if (!emp.name?.trim()) {
            errors.push('缺少姓名字段');
            errorCount++;
            continue;
          }
          if (!emp.departmentName?.trim()) {
            errors.push(`${emp.name}: 缺少部门字段`);
            errorCount++;
            continue;
          }
          
          const deptId = deptMap.get(emp.departmentName);
          if (!deptId) {
            errors.push(`${emp.name}: 部门\"${emp.departmentName}\"不存在`);
            errorCount++;
            continue;
          }
          
          let joinDate = new Date();
          if (emp.joinDate) {
            const dateStr = emp.joinDate.toString().trim();
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) {
              joinDate = parsed;
            } else {
              errors.push(`${emp.name}: 入职时间格式错误\"${dateStr}\"，应为 YYYY-MM-DD 或 YYYY/MM/DD`);
              errorCount++;
              continue;
            }
          }
          
          const existingEmployee = await db.select().from(employees).where(
            and(
              eq(employees.name, emp.name),
              eq(employees.departmentId, deptId)
            )
          ).limit(1);
          const existing = existingEmployee.length > 0 ? existingEmployee[0] : null;
          
          const updateData: any = {
            position: emp.position?.trim() || '',
            level: emp.level?.trim() || '',
            joinDate: joinDate,
            jobResponsibilities: emp.jobResponsibilities?.trim() || '',
            workTenet: emp.workTenet?.trim() || '',
          };
          
          if (emp.photoUrl?.trim()) {
            updateData.workPhoto = emp.photoUrl.trim();
          }
          
          if (existing) {
            await db.update(employees).set(updateData).where(eq(employees.id, existing.id));
          } else {
            await db.insert(employees).values({
              name: emp.name.trim(),
              departmentId: deptId,
              ...updateData,
              status: 'active' as const,
            });
          }
          
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Employee ${emp.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      return {
        successCount,
        errorCount,
        errors: errors.slice(0, 10),
      };
    }),

  reorder: protectedProcedure
    .input(z.object({
      id: z.number(),
      direction: z.enum(['up', 'down']),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // 获取所有在职员工，按当前顺序排列
      const { asc: ascFn } = await import('drizzle-orm');
      const allEmps = await db.select()
        .from(employees)
        .where(eq(employees.status, 'active'))
        .orderBy(ascFn(employees.sortOrder), ascFn(employees.id));

      const currentIdx = allEmps.findIndex(e => e.id === input.id);
      if (currentIdx === -1) throw new Error('Employee not found');

      const swapIdx = input.direction === 'up' ? currentIdx - 1 : currentIdx + 1;
      if (swapIdx < 0 || swapIdx >= allEmps.length) return { success: true }; // 已在边界

      const current = allEmps[currentIdx];
      const swap = allEmps[swapIdx];

      // 交换 sortOrder
      const currentOrder = current.sortOrder;
      const swapOrder = swap.sortOrder;

      // 如果两个 sortOrder 相同，就用索引作为新的 sortOrder
      if (currentOrder === swapOrder) {
        // 重新设置所有员工的 sortOrder
        for (let i = 0; i < allEmps.length; i++) {
          await db.update(employees).set({ sortOrder: i }).where(eq(employees.id, allEmps[i].id));
        }
        // 再次交换
        const newCurrentOrder = currentIdx;
        const newSwapOrder = swapIdx;
        await db.update(employees).set({ sortOrder: newSwapOrder }).where(eq(employees.id, current.id));
        await db.update(employees).set({ sortOrder: newCurrentOrder }).where(eq(employees.id, swap.id));
      } else {
        await db.update(employees).set({ sortOrder: swapOrder }).where(eq(employees.id, current.id));
        await db.update(employees).set({ sortOrder: currentOrder }).where(eq(employees.id, swap.id));
      }

      return { success: true };
    }),
});

// ========== 荣誉路由 ==========
const honorRouter = router({
  listByEmployee: publicProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      return getHonorsByEmployeeId(input.employeeId);
    }),
  
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    return db.select().from(honors);
  }),
  
  listNew: publicProcedure.query(async () => {
    return getNewHonors();
  }),
  
  create: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      title: z.string(),
      description: z.string().optional(),
      awardDate: z.date(),
      icon: z.string().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const result = await db.insert(honors).values({
        employeeId: input.employeeId,
        title: input.title,
        description: input.description,
        awardDate: input.awardDate,
        icon: input.icon || 'trophy',
        category: input.category || '班组之星',
        isNew: true,
      });
      return result;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      awardDate: z.date().optional(),
      isNew: z.boolean().optional(),
      icon: z.string().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const { id, ...updates } = input;
      const result = await db.update(honors).set(updates).where(eq(honors.id, id));
      return result;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const result = await db.delete(honors).where(eq(honors.id, input.id));
      return result;
    }),
  
  markAsOld: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const result = await db.update(honors).set({ isNew: false }).where(eq(honors.id, input.id));
      return result;
    }),
  
  listCategories: publicProcedure.query(async () => {
    return await getAllHonorCategories();
  }),
  
  createCategory: protectedProcedure
    .input(z.object({
      category: z.string().min(1),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      const result = await createHonorCategory(input.category, input.description);
      return result;
    }),
  
  deleteCategory: protectedProcedure
    .input(z.object({
      category: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      const result = await deleteHonorCategory(input.category);
      return result;
    }),
});

// ========== 轮播策略路由 ==========
const playbackRouter = router({
  getActive: publicProcedure.query(async () => {
    return getActivePlaybackStrategy();
  }),
  
  list: publicProcedure.query(async () => {
    return getAllPlaybackStrategies();
  }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      displayMode: z.enum(['all', 'core_bones', 'company_showcase']),
      description: z.string().optional(),
      autoPlayInterval: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const result = await db.insert(playbackStrategies).values({
        name: input.name,
        displayMode: input.displayMode,
        description: input.description,
        autoPlayInterval: input.autoPlayInterval || 5000,
      });
      
      // 获取新创建的策略
      const strategies = await getAllPlaybackStrategies();
      return strategies[strategies.length - 1];
    }),
  
  setActive: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // 先将所有策略设为非活跃
      await db.update(playbackStrategies).set({ isActive: false });
      
      // 再将指定策略设为活跃
      const result = await db.update(playbackStrategies).set({ isActive: true }).where(eq(playbackStrategies.id, input.id));
      return result;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const result = await db.delete(playbackStrategies).where(eq(playbackStrategies.id, input.id));
      return result;
    }),
});

// ========== 背景图片路由 ==========
const backgroundRouter = router({
  getActive: publicProcedure.query(async () => {
    return getActiveBackground();
  }),
  
  list: publicProcedure.query(async () => {
    return getAllBackgrounds();
  }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      backgroundUrl: z.string().url(),
      description: z.string().optional(),
      displayMode: z.enum(['all', 'core_bones']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const result = await db.insert(showcaseBackgrounds).values({
        name: input.name,
        backgroundUrl: input.backgroundUrl,
        description: input.description,
        displayMode: input.displayMode || 'all',
        isActive: false,
      });
      return result;
    }),
  
  setActive: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      await db.update(showcaseBackgrounds).set({ isActive: false });
      
      const result = await db.update(showcaseBackgrounds).set({ isActive: true }).where(eq(showcaseBackgrounds.id, input.id));
      return result;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const result = await db.delete(showcaseBackgrounds).where(eq(showcaseBackgrounds.id, input.id));
      return result;
    }),
});

// ========== 文件上传路由 ==========
const uploadRouter = router({
  uploadPhoto: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileData: z.string(), // base64 编码的文件数据
      fileType: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'UNAUTHORIZED' });
      
      try {
        // 转换 base64 为 Buffer
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // 生成安全的文件名
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileKey = `employees/${timestamp}-${randomStr}-${input.fileName}`;
        
        // 上传到 S3
        const { url } = await storagePut(fileKey, buffer, input.fileType);
        
        return { url };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '文件上传失败',
        });
      }
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  
  companies: companyRouter,
  departments: departmentRouter,
  employees: employeeRouter,
  honors: honorRouter,
  playback: playbackRouter,
  backgrounds: backgroundRouter,
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
