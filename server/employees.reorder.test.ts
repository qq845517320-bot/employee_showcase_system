import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './routers';
import { getDb } from './db';
import { employees } from '../drizzle/schema';
import { eq, inArray, asc } from 'drizzle-orm';

describe('员工排序功能测试', () => {
  const TEST_NAME_PREFIX = '测试排序员工_';
  let testEmployeeIds: number[] = [];
  const mockCtx = {
    user: { id: 1, role: 'admin' as const, openId: 'test-admin', name: 'Test Admin' },
  };

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // 清理可能残留的测试数据
    await db.delete(employees).where(eq(employees.position, '测试排序岗位'));

    // 创建 3 个测试员工，sortOrder 间隔 100 避免与真实员工冲突
    for (let i = 0; i < 3; i++) {
      await db.insert(employees).values({
        name: `${TEST_NAME_PREFIX}${i + 1}`,
        departmentId: 1,
        position: '测试排序岗位',
        level: '初级',
        joinDate: new Date(),
        sortOrder: 1000 + i * 10,
        status: 'active',
      });
    }

    // 通过名字查询刚插入的员工 ID
    const inserted = await db.select().from(employees)
      .where(eq(employees.position, '测试排序岗位'))
      .orderBy(asc(employees.sortOrder));
    testEmployeeIds = inserted.map(e => e.id);
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;
    if (testEmployeeIds.length > 0) {
      await db.delete(employees).where(inArray(employees.id, testEmployeeIds));
    }
  });

  it('应该能够上移员工（交换 sortOrder）', async () => {
    expect(testEmployeeIds.length).toBeGreaterThanOrEqual(2);
    const caller = appRouter.createCaller({ ...mockCtx } as any);
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // 获取上移前的 sortOrder
    const [before0] = await db.select().from(employees).where(eq(employees.id, testEmployeeIds[0])).limit(1);
    const [before1] = await db.select().from(employees).where(eq(employees.id, testEmployeeIds[1])).limit(1);

    // 上移第二个员工（应该与第一个交换）
    const result = await caller.employees.reorder({ id: testEmployeeIds[1], direction: 'up' });
    expect(result.success).toBe(true);

    // 验证顺序已交换
    const [after0] = await db.select().from(employees).where(eq(employees.id, testEmployeeIds[0])).limit(1);
    const [after1] = await db.select().from(employees).where(eq(employees.id, testEmployeeIds[1])).limit(1);

    expect(after1.sortOrder).toBe(before0.sortOrder);
    expect(after0.sortOrder).toBe(before1.sortOrder);
  });

  it('应该能够下移员工（交换 sortOrder）', async () => {
    expect(testEmployeeIds.length).toBeGreaterThanOrEqual(3);
    const caller = appRouter.createCaller({ ...mockCtx } as any);
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // 重置 sortOrder 到已知状态
    for (let i = 0; i < testEmployeeIds.length; i++) {
      await db.update(employees).set({ sortOrder: 1000 + i * 10 }).where(eq(employees.id, testEmployeeIds[i]));
    }

    const [before1] = await db.select().from(employees).where(eq(employees.id, testEmployeeIds[1])).limit(1);
    const [before2] = await db.select().from(employees).where(eq(employees.id, testEmployeeIds[2])).limit(1);

    // 下移第二个员工（应该与第三个交换）
    const result = await caller.employees.reorder({ id: testEmployeeIds[1], direction: 'down' });
    expect(result.success).toBe(true);

    const [after1] = await db.select().from(employees).where(eq(employees.id, testEmployeeIds[1])).limit(1);
    const [after2] = await db.select().from(employees).where(eq(employees.id, testEmployeeIds[2])).limit(1);

    expect(after1.sortOrder).toBe(before2.sortOrder);
    expect(after2.sortOrder).toBe(before1.sortOrder);
  });

  it('reorder 接口应该返回 success: true', async () => {
    expect(testEmployeeIds.length).toBeGreaterThanOrEqual(1);
    const caller = appRouter.createCaller({ ...mockCtx } as any);

    const result = await caller.employees.reorder({ id: testEmployeeIds[0], direction: 'down' });
    expect(result).toEqual({ success: true });
  });
});
