-- 修改财务部 ID 从 30001 改为 7
-- 执行时间: 2026-04-03

-- 步骤 1: 检查当前状态
SELECT '=== 修改前的数据 ===' AS status;
SELECT id, name FROM employee_showcase.departments WHERE id = 30001 OR name = '财务部';
SELECT COUNT(*) as '财务部员工数' FROM employee_showcase.employees WHERE departmentId = 30001;

-- 步骤 2: 更新员工表中的外键引用
UPDATE employee_showcase.employees SET departmentId = 7 WHERE departmentId = 30001;

-- 步骤 3: 更新部门表的 ID
UPDATE employee_showcase.departments SET id = 7 WHERE id = 30001;

-- 步骤 4: 验证修改结果
SELECT '=== 修改后的数据 ===' AS status;
SELECT id, name FROM employee_showcase.departments WHERE id = 7 OR name = '财务部';
SELECT COUNT(*) as '财务部员工数' FROM employee_showcase.employees WHERE departmentId = 7;

-- 步骤 5: 查看所有部门
SELECT '=== 所有部门列表 ===' AS status;
SELECT id, name, description FROM employee_showcase.departments ORDER BY id;
