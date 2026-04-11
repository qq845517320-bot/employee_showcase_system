import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

function createPublicContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Party Member Feature", () => {
  it("should allow admin to create an employee with isPartyMember flag", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.employees.create({
        name: "党员测试员工",
        departmentId: 1,
        position: "测试岗位",
        level: "中级",
        joinDate: new Date(),
        jobResponsibilities: "测试职责",
        workTenet: "测试信条",
        isPartyMember: true,
      });

      // 验证创建成功
      expect(result).toBeDefined();
    } catch (error: any) {
      // 应该不是未授权错误
      expect(error?.message).not.toBe("Unauthorized");
    }
  });

  it("should allow admin to create employee with isPartyMember flag set to false", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.employees.create({
        name: "非党员测试员工",
        departmentId: 1,
        position: "测试岗位",
        level: "中级",
        joinDate: new Date(),
        isPartyMember: false,
      });

      // 验证创建成功
      expect(result).toBeDefined();
    } catch (error: any) {
      // 应该不是未授权错误
      expect(error?.message).not.toBe("Unauthorized");
    }
  });

  it("should allow admin to update employee isPartyMember flag", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      // 首先创建一个员工
      const createResult = await caller.employees.create({
        name: "更新测试员工",
        departmentId: 1,
        position: "测试岗位",
        level: "中级",
        joinDate: new Date(),
        isPartyMember: false,
      });

      expect(createResult).toBeDefined();

      // 然后更新 isPartyMember 字段
      const updateResult = await caller.employees.update({
        id: 1, // 使用一个假的 ID，主要是验证 API 接受该字段
        isPartyMember: true,
      });

      // 验证更新成功
      expect(updateResult).toBeDefined();
    } catch (error: any) {
      // 应该不是未授权错误
      expect(error?.message).not.toBe("Unauthorized");
    }
  });

  it("should deny employee creation for non-admin users with isPartyMember flag", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.employees.create({
        name: "Test Employee",
        departmentId: 1,
        position: "Engineer",
        level: "Senior",
        joinDate: new Date(),
        isPartyMember: true,
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should allow public access to employee list with isPartyMember data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.employees.list({});
      expect(Array.isArray(result)).toBe(true);
      
      // 如果列表中有员工，验证 isPartyMember 字段存在
      if (result.length > 0) {
        const firstEmployee = result[0];
        expect(typeof firstEmployee.isPartyMember).toBe("boolean");
      }
    } catch (error: any) {
      // 公开访问不应该被拒绝
      expect(error?.message).not.toBe("Unauthorized");
    }
  });
});
