import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 部门表
 */
export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  order: int("order").default(0).notNull(), // 用于排序
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

/**
 * 员工表
 */
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  departmentId: int("departmentId").notNull(), // 外键关联部门
  position: varchar("position", { length: 100 }).notNull(), // 岗位
  level: varchar("level", { length: 50 }).notNull(), // 职级（如：高级、中级、初级）
  joinDate: timestamp("joinDate").notNull(), // 入职时间（本公司入职时间）
  systemJoinDate: timestamp("systemJoinDate"), // 入职深国际系统时间（可选）
  workPhoto: varchar("workPhoto", { length: 500 }), // 工作照 URL（S3）
  jobResponsibilities: text("jobResponsibilities"), // 工作职责
  workTenet: text("workTenet"), // 工作信条
  status: mysqlEnum("status", ["active", "inactive", "archived"]).default("active").notNull(), // 在职、离职、归档
  isCoreBone: boolean("isCoreBone").default(false).notNull(), // 是否为核心骨干
  isPartyMember: boolean("isPartyMember").default(false).notNull(), // 是否为党员
  sortOrder: int("sortOrder").default(0).notNull(), // 显示顺序（数字越小越靠前）
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

/**
 * 荣誉表
 */
export const honors = mysqlTable("honors", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(), // 外键关联员工
  title: varchar("title", { length: 100 }).notNull(), // 荣誉名称（如：班组之星、优秀员工等）
  description: text("description"), // 荣誉描述
  awardDate: timestamp("awardDate").notNull(), // 获奖时间
  isNew: boolean("isNew").default(true).notNull(), // 是否为新荣誉（用于显示 New 标签）
  icon: varchar("icon", { length: 50 }).default("trophy").notNull(), // 图标类型（trophy、star 等）
  category: varchar("category", { length: 100 }).default("班组之星").notNull(), // 奖项分类
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Honor = typeof honors.$inferSelect;
export type InsertHonor = typeof honors.$inferInsert;

/**
 * 轮播策略表
 */
export const playbackStrategies = mysqlTable("playback_strategies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(), // 策略名称（如：普通工作日、参观接待）
  displayMode: mysqlEnum("displayMode", ["all", "core_bones", "company_showcase"]).notNull(), // 展示模式
  description: text("description"), // 策略描述
  isActive: boolean("isActive").default(false).notNull(), // 是否为当前活跃策略
  autoPlayInterval: int("autoPlayInterval").default(5000).notNull(), // 自动轮播间隔（毫秒）
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlaybackStrategy = typeof playbackStrategies.$inferSelect;
export type InsertPlaybackStrategy = typeof playbackStrategies.$inferInsert;

/**
 * 大屏背景配置表
 */
export const showcaseBackgrounds = mysqlTable("showcase_backgrounds", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // 背景名称
  backgroundUrl: varchar("backgroundUrl", { length: 500 }).notNull(), // 背景图片 URL（S3）
  description: text("description"), // 背景描述
  isActive: boolean("isActive").default(false).notNull(), // 是否为当前活跃背景
  displayMode: mysqlEnum("displayMode", ["all", "core_bones"]).default("all").notNull(), // 适用的展示模式
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShowcaseBackground = typeof showcaseBackgrounds.$inferSelect;
export type InsertShowcaseBackground = typeof showcaseBackgrounds.$inferInsert;

/**
 * 奖项分类表
 */
export const honorCategories = mysqlTable("honor_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(), // 分类名称
  description: text("description"), // 分类描述
  order: int("order").default(0).notNull(), // 排序顺序
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HonorCategory = typeof honorCategories.$inferSelect;
export type InsertHonorCategory = typeof honorCategories.$inferInsert;

/**
 * 公司表
 */
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(), // 公司名称
  description: text("description"), // 公司描述
  order: int("order").default(0).notNull(), // 排序顺序
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

/**
 * 公司照片表
 */
export const companyPhotos = mysqlTable("company_photos", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(), // 外键关联公司
  photoUrl: varchar("photoUrl", { length: 500 }).notNull(), // 照片 URL（S3）
  title: varchar("title", { length: 255 }).notNull(), // 照片标题（必填）
  subtitle: varchar("subtitle", { length: 255 }), // 照片副标题（可选）
  description: text("description"), // 照片描述
  order: int("order").default(0).notNull(), // 排序顺序
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanyPhoto = typeof companyPhotos.$inferSelect;
export type InsertCompanyPhoto = typeof companyPhotos.$inferInsert;
