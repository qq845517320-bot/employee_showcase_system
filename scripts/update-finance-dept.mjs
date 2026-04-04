#!/usr/bin/env node

/**
 * 修改财务部 ID 从 30001 改为 7
 * 使用方法: node scripts/update-finance-dept.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 加载环境变量
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ 错误: DATABASE_URL 环境变量未设置');
  process.exit(1);
}

// 解析数据库连接字符串
// 格式: mysql://user:password@host:port/database
const parseDbUrl = (url) => {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
  };
};

const config = parseDbUrl(DATABASE_URL);

async function updateFinanceDepartment() {
  let connection;
  
  try {
    console.log('🔗 连接到数据库...');
    // 添加 SSL 支持（用于 TiDB Cloud）
    const connectionConfig = {
      ...config,
      ssl: true,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
    };
    try {
      connection = await mysql.createConnection(connectionConfig);
    } catch (sslError) {
      // 如果 SSL 失败，尝试不使用 SSL
      console.log('⚠️  SSL 连接失败，正在尝试不使用 SSL...');
      connection = await mysql.createConnection({
        ...config,
        ssl: false,
      });
    }
    console.log('✅ 数据库连接成功\n');

    // 步骤 1: 查看修改前的数据
    console.log('📋 步骤 1: 查看修改前的财务部数据');
    console.log('─'.repeat(50));
    
    const [beforeDept] = await connection.execute(
      'SELECT id, name, description FROM departments WHERE id = 30001 OR name = ?',
      ['财务部']
    );
    
    if (beforeDept.length === 0) {
      console.error('❌ 错误: 未找到财务部（ID: 30001）');
      console.log('当前所有部门:');
      const [allDepts] = await connection.execute('SELECT id, name FROM departments ORDER BY id');
      console.table(allDepts);
      process.exit(1);
    }
    
    console.log('修改前的财务部信息:');
    console.table(beforeDept);
    
    // 查看财务部员工数
    const [empCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM employees WHERE departmentId = 30001'
    );
    console.log(`\n财务部员工数: ${empCount[0].count} 人\n`);

    // 步骤 2: 更新员工表
    console.log('📋 步骤 2: 更新员工表中的部门 ID');
    console.log('─'.repeat(50));
    
    const [empUpdateResult] = await connection.execute(
      'UPDATE employees SET departmentId = 7 WHERE departmentId = 30001'
    );
    console.log(`✅ 已更新 ${empUpdateResult.affectedRows} 条员工记录\n`);

    // 步骤 3: 更新部门表
    console.log('📋 步骤 3: 更新部门表的 ID');
    console.log('─'.repeat(50));
    
    const [deptUpdateResult] = await connection.execute(
      'UPDATE departments SET id = 7 WHERE id = 30001'
    );
    console.log(`✅ 已更新 ${deptUpdateResult.affectedRows} 条部门记录\n`);

    // 步骤 4: 验证修改结果
    console.log('📋 步骤 4: 验证修改结果');
    console.log('─'.repeat(50));
    
    const [afterDept] = await connection.execute(
      'SELECT id, name, description FROM departments WHERE id = 7'
    );
    
    if (afterDept.length === 0) {
      console.error('❌ 验证失败: 修改后未找到财务部');
      process.exit(1);
    }
    
    console.log('修改后的财务部信息:');
    console.table(afterDept);
    
    // 查看更新后的员工数
    const [empCountAfter] = await connection.execute(
      'SELECT COUNT(*) as count FROM employees WHERE departmentId = 7'
    );
    console.log(`\n财务部员工数: ${empCountAfter[0].count} 人\n`);

    // 步骤 5: 显示所有部门
    console.log('📋 步骤 5: 所有部门列表');
    console.log('─'.repeat(50));
    
    const [allDepts] = await connection.execute(
      'SELECT id, name, description FROM departments ORDER BY id'
    );
    console.table(allDepts);

    console.log('\n✅ 修改完成！财务部 ID 已从 30001 改为 7');

  } catch (error) {
    console.error('❌ 执行出错:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 执行脚本
updateFinanceDepartment();
