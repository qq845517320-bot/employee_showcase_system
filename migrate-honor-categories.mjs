import mysql2 from 'mysql2/promise';

async function migrate() {
  try {
    const connection = await mysql2.createConnection(process.env.DATABASE_URL);
    
    console.log('Creating honor_categories table...');
    
    const sql = `CREATE TABLE IF NOT EXISTS \`honor_categories\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`name\` varchar(100) NOT NULL,
      \`description\` text,
      \`order\` int NOT NULL DEFAULT 0,
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT \`honor_categories_id\` PRIMARY KEY(\`id\`),
      CONSTRAINT \`honor_categories_name_unique\` UNIQUE(\`name\`)
    );`;
    
    try {
      console.log(`\nExecuting: Creating honor_categories table`);
      await connection.execute(sql);
      console.log('✓ Table created successfully');
      
      // 插入默认分类
      const defaultCategories = ['班组之星', '集团级奖项', '公司级奖项'];
      for (let i = 0; i < defaultCategories.length; i++) {
        await connection.execute(
          'INSERT IGNORE INTO `honor_categories` (`name`, `order`) VALUES (?, ?)',
          [defaultCategories[i], i]
        );
      }
      console.log('✓ Default categories inserted');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Table already exists, skipping...');
      } else {
        throw error;
      }
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
