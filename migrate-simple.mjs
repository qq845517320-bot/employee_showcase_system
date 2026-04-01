import mysql from 'mysql2/promise';

async function migrate() {
  let connection;
  try {
    // 从 DATABASE_URL 解析连接信息
    const url = new URL(process.env.DATABASE_URL);
    connection = await mysql.createConnection({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
      ssl: { rejectUnauthorized: false },
    });
    
    console.log('Connected to database');
    console.log('Executing migrations...\n');
    
    // 执行迁移 SQL
    const statements = [
      // 先删除使用 'honors' 模式的策略
      `DELETE FROM playback_strategies WHERE displayMode = 'honors'`,
      `DELETE FROM showcase_backgrounds WHERE displayMode = 'honors'`,
      // 然后修改枚举类型
      `ALTER TABLE playback_strategies MODIFY COLUMN displayMode enum('all','core_bones') NOT NULL`,
      `ALTER TABLE showcase_backgrounds MODIFY COLUMN displayMode enum('all','core_bones') NOT NULL DEFAULT 'all'`,
      // 最后添加 category 字段
      `ALTER TABLE honors ADD COLUMN category enum('班组之星','集团级奖项','公司级奖项') DEFAULT '班组之星' NOT NULL`,
    ];
    
    for (const sql of statements) {
      try {
        console.log(`Executing: ${sql.substring(0, 60)}...`);
        await connection.execute(sql);
        console.log('✓ Success\n');
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log('ℹ️ Column already exists, skipping...\n');
        } else if (error.message.includes('Incorrect enum value')) {
          console.log('ℹ️ Enum values already exist, skipping...\n');
        } else {
          throw error;
        }
      }
    }
    
    console.log('✅ All migrations completed successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
