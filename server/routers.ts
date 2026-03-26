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
  getAllBackgrounds
} from "./db";
import { departments, employees, honors, playbackStrategies, showcaseBackgrounds } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

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
      displayMode: z.enum(['all', 'core_bones', 'honors']).optional(),
    }))
    .query(async ({ input }) => {
      if (input.displayMode === 'core_bones') {
        return getCoreEmployees();
      } else if (input.displayMode === 'honors') {
        return getEmployeesWithNewHonors();
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
      jobResponsibilities: z.string().optional(),
      motto: z.string().optional(),
      workPhoto: z.string().optional(),
      isCoreBone: z.boolean().optional(),
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
        jobResponsibilities: input.jobResponsibilities,
        motto: input.motto,
        workPhoto: input.workPhoto,
        isCoreBone: input.isCoreBone || false,
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
      jobResponsibilities: z.string().optional(),
      motto: z.string().optional(),
      workPhoto: z.string().optional(),
      status: z.enum(['active', 'inactive', 'archived']).optional(),
      isCoreBone: z.boolean().optional(),
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
});

// ========== 荣誉路由 ==========
const honorRouter = router({
  listByEmployee: publicProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      return getHonorsByEmployeeId(input.employeeId);
    }),
  
  listNew: publicProcedure.query(async () => {
    return getNewHonors();
  }),
  
  create: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      awardDate: z.date(),
      icon: z.string().optional(),
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
      displayMode: z.enum(['all', 'core_bones', 'honors']),
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
      return result;
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
      displayMode: z.enum(['all', 'core_bones', 'honors']).optional(),
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
  
  departments: departmentRouter,
  employees: employeeRouter,
  honors: honorRouter,
  playback: playbackRouter,
  backgrounds: backgroundRouter,
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
