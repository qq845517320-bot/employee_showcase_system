import mysql2 from 'mysql2/promise';

async function migrate() {
  try {
    const connection = await mysql2.createConnection(process.env.DATABASE_URL);
    
    console.log('Executing migration to modify category column...');
    
    const sql = `ALTER TABLE \`honors\` MODIFY COLUMN \`category\` varchar(100) NOT NULL DEFAULT '班组之星'`;
    
    try {
      console.log(`\nExecuting: ${sql}`);
      await connection.execute(sql);
      console.log('✓ Migration completed successfully');
    } catch (error) {
      console.error('Error:', error.message);
      throw error;
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
