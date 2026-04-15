-- ========================================
-- 员工风采展示系统 - 数据库初始化脚本
-- ========================================
-- 说明: 此脚本用于初始化数据库和创建必要的表
-- 使用: mysql -u root -p < init-database.sql

-- 创建数据库
CREATE DATABASE IF NOT EXISTS employee_showcase 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE employee_showcase;

-- 创建用户（如果不存在）
-- 注意: 请将 'password' 替换为实际的强密码
CREATE USER IF NOT EXISTS 'showcase_user'@'localhost' IDENTIFIED BY 'password';

-- 授予权限
GRANT ALL PRIVILEGES ON employee_showcase.* TO 'showcase_user'@'localhost';
FLUSH PRIVILEGES;

-- ========================================
-- 创建表结构
-- ========================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  open_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_open_id (open_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 员工表
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  photo_url VARCHAR(1024),
  honor_type VARCHAR(50),
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_department (department),
  INDEX idx_honor_type (honor_type),
  INDEX idx_is_active (is_active),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 公司风采照片表
CREATE TABLE IF NOT EXISTS company_photos (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  photo_url VARCHAR(1024) NOT NULL,
  category VARCHAR(100),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_is_active (is_active),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 轮播策略表
CREATE TABLE IF NOT EXISTS playback_strategies (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  display_mode VARCHAR(50) NOT NULL,
  description TEXT,
  interval_seconds INT DEFAULT 10,
  is_active BOOLEAN DEFAULT FALSE,
  config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_display_mode (display_mode),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 部门表
CREATE TABLE IF NOT EXISTS departments (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_is_active (is_active),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 荣誉类型表
CREATE TABLE IF NOT EXISTS honor_types (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon_url VARCHAR(1024),
  color VARCHAR(50),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_is_active (is_active),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 插入初始数据
-- ========================================

-- 插入默认部门
INSERT INTO departments (id, name, description, sort_order) VALUES
  ('dept-001', '港口运营部', '负责港口日常运营管理', 1),
  ('dept-002', '安全环保部', '负责安全生产和环保工作', 2),
  ('dept-003', '技术设备部', '负责设备维护和技术支持', 3),
  ('dept-004', '人力资源部', '负责人力资源管理', 4),
  ('dept-005', '财务部', '负责财务管理', 5);

-- 插入默认荣誉类型
INSERT INTO honor_types (id, name, description, color, sort_order) VALUES
  ('honor-001', '先进个人', '表现优异的员工', '#FF6B6B', 1),
  ('honor-002', '优秀团队', '表现优异的团队', '#4ECDC4', 2),
  ('honor-003', '技术能手', '技术突出的员工', '#45B7D1', 3),
  ('honor-004', '安全卫士', '安全工作表现优异', '#FFA07A', 4),
  ('honor-005', '服务标兵', '服务质量优异', '#98D8C8', 5);

-- 插入默认轮播策略
INSERT INTO playback_strategies (id, name, display_mode, description, interval_seconds, is_active) VALUES
  ('strategy-001', '全体员工风采展示', 'all_employees', '展示全体员工信息', 10, TRUE),
  ('strategy-002', '骨干员工风采展示', 'core_employees', '仅展示骨干员工信息', 10, FALSE),
  ('strategy-003', '公司风采展示', 'company_showcase', '展示公司风采照片', 10, FALSE);

-- ========================================
-- 创建视图
-- ========================================

-- 员工统计视图
CREATE OR REPLACE VIEW v_employee_stats AS
SELECT 
  d.name as department_name,
  COUNT(e.id) as employee_count,
  SUM(CASE WHEN e.honor_type IS NOT NULL THEN 1 ELSE 0 END) as honor_count
FROM departments d
LEFT JOIN employees e ON d.id = e.department
WHERE e.is_active = TRUE
GROUP BY d.id, d.name;

-- ========================================
-- 创建索引
-- ========================================

-- 员工表优化索引
CREATE INDEX idx_employees_department_active ON employees(department, is_active);
CREATE INDEX idx_employees_honor_active ON employees(honor_type, is_active);

-- 公司照片表优化索引
CREATE INDEX idx_photos_category_active ON company_photos(category, is_active);

-- ========================================
-- 设置字符集
-- ========================================

ALTER DATABASE employee_showcase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- 初始化完成
-- ========================================

-- 显示创建的表
SHOW TABLES;

-- 显示数据库信息
SELECT 
  'Database initialized successfully!' as status,
  NOW() as timestamp;
