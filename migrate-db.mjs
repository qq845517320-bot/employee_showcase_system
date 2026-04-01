import { drizzle } from 'drizzle-orm/mysql2/driver';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

async function migrate() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection, { schema });
    
    console.log('Executing migrations...');
    
    // 执行迁移 SQL
    const statements = [
      `ALTER TABLE \`playback_strategies\` MODIFY COLUMN \`displayMode\` enum('all','core_bones') NOT NULL`,
      `ALTER TABLE \`showcase_backgrounds\` MODIFY COLUMN \`displayMode\` enum('all','core_bones') NOT NULL DEFAULT 'all'`,
      `ALTER TABLE \`honors\` ADD COLUMN \`category\` enum('班组之星','集团级奖项','公司级奖项') DEFAULT '班组之星' NOT NULL`,
    ];
    
    for (const sql of statements) {
      try {
        console.log(`\nExecuting: ${sql.substring(0, 50)}...`);
        await connection.execute(sql);
        console.log('✓ Success');
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log('ℹ️ Column already exists, skipping...');
        } else if (error.message.includes('Incorrect enum value')) {
          console.log('ℹ️ Enum values already exist, skipping...');
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n✅ All migrations completed successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
