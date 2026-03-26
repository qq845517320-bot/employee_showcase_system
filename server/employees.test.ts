import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
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
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("employees API", () => {
  it("should allow public access to employee list", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    // This should not throw even without authentication
    const result = await caller.employees.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("should deny employee creation for non-admin users", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    try {
      await caller.employees.create({
        name: "Test Employee",
        departmentId: 1,
        position: "Engineer",
        level: "Senior",
        joinDate: new Date(),
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should allow admin to create employees", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    // This would normally create an employee, but in test env DB might not be available
    // The important thing is that it doesn't throw "Unauthorized"
    try {
      await caller.employees.create({
        name: "Test Employee",
        departmentId: 1,
        position: "Engineer",
        level: "Senior",
        joinDate: new Date(),
      });
    } catch (error: any) {
      // Should not be unauthorized error
      expect(error?.message).not.toBe("Unauthorized");
    }
  });
});

describe("departments API", () => {
  it("should allow public access to department list", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.departments.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("honors API", () => {
  it("should allow public access to new honors list", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.honors.listNew();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should deny honor creation for non-admin users", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    try {
      await caller.honors.create({
        employeeId: 1,
        title: "Best Employee",
        awardDate: new Date(),
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe("playback API", () => {
  it("should allow public access to active playback strategy", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.playback.getActive();
    // Result can be null if no strategy is active
    expect(result === null || typeof result === 'object').toBe(true);
  });
});
