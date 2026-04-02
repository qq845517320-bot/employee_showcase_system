import { eq, and, inArray, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, departments, employees, honors, playbackStrategies, showcaseBackgrounds, honorCategories } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== 部门相关查询 ==========

export async function getAllDepartments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(departments).orderBy(departments.order);
}

export async function getDepartmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(departments).where(eq(departments.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ========== 员工相关查询 ==========

export async function getEmployeesByDepartment(departmentId: number | null) {
  const db = await getDb();
  if (!db) return [];
  
  if (departmentId === null) {
    // 获取所有在职员工
    return db.select().from(employees).where(eq(employees.status, 'active')).orderBy(asc(employees.sortOrder), asc(employees.id));
  }
  
  return db.select().from(employees).where(
    and(
      eq(employees.departmentId, departmentId),
      eq(employees.status, 'active')
    )
  ).orderBy(asc(employees.sortOrder), asc(employees.id));
}

export async function getEmployeeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getActiveEmployees() {
  const db = await getDb();
  if (!db) return [];
  const emps = await db.select().from(employees).where(eq(employees.status, 'active')).orderBy(asc(employees.sortOrder), asc(employees.id));
  
  // 为每个员工添加 honors 数据
  const result = await Promise.all(
    emps.map(async (emp) => {
      const honors_list = await getHonorsByEmployeeId(emp.id);
      return { ...emp, honors: honors_list };
    })
  );
  return result;
}

export async function getCoreEmployees() {
  const db = await getDb();
  if (!db) return [];
  const emps = await db.select().from(employees).where(
    and(
      eq(employees.status, 'active'),
      eq(employees.isCoreBone, true)
    )
  ).orderBy(asc(employees.sortOrder), asc(employees.id));
  
  // 为每个员工添加 honors 数据
  const result = await Promise.all(
    emps.map(async (emp) => {
      const honors_list = await getHonorsByEmployeeId(emp.id);
      return { ...emp, honors: honors_list };
    })
  );
  return result;
}

// ========== 荣誉相关查询 ==========

export async function getHonorsByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(honors).where(eq(honors.employeeId, employeeId));
}

export async function getNewHonors() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(honors).where(eq(honors.isNew, true));
}

export async function getEmployeesWithNewHonors() {
  const db = await getDb();
  if (!db) return [];
  
  const newHonorsList = await db.select().from(honors).where(eq(honors.isNew, true));
  if (newHonorsList.length === 0) return [];
  
  const employeeIds = Array.from(new Set(newHonorsList.map(h => h.employeeId)));
  const emps = await db.select().from(employees).where(
    and(
      inArray(employees.id, employeeIds),
      eq(employees.status, 'active')
    )
  );
  
  // 为每个员工添加 honors 数据
  const result = await Promise.all(
    emps.map(async (emp) => {
      const honors_list = await getHonorsByEmployeeId(emp.id);
      return { ...emp, honors: honors_list };
    })
  );
  return result;
}

// ========== 轮播策略相关查询 ==========

export async function getActivePlaybackStrategy() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(playbackStrategies).where(eq(playbackStrategies.isActive, true)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllPlaybackStrategies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(playbackStrategies);
}

// ========== 背景图片相关查询 ==========

export async function getActiveBackground() {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(showcaseBackgrounds)
    .where(eq(showcaseBackgrounds.isActive, true))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getAllBackgrounds() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(showcaseBackgrounds).orderBy(showcaseBackgrounds.createdAt);
}

// ========== 奖项分类相关查询 ==========

export async function getAllHonorCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(honorCategories).orderBy(honorCategories.order);
}

export async function getHonorCategoryByName(name: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(honorCategories).where(eq(honorCategories.name, name)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createHonorCategory(name: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const existing = await getHonorCategoryByName(name);
  if (existing) {
    return existing;
  }
  
  const categories = await getAllHonorCategories();
  const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.order)) : -1;
  
  const result = await db.insert(honorCategories).values({
    name,
    description,
    order: maxOrder + 1,
  });
  
  return await getHonorCategoryByName(name);
}

export async function deleteHonorCategory(name: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Check if there are any honors with this category
  const honorsWithCategory = await db.select().from(honors).where(eq(honors.category, name));
  if (honorsWithCategory.length > 0) {
    throw new Error(`Cannot delete category "${name}" because it has ${honorsWithCategory.length} associated honor(s)`);
  }
  
  await db.delete(honorCategories).where(eq(honorCategories.name, name));
  return { success: true };
}
