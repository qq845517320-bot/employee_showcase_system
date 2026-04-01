import { createConnection } from 'mysql2/promise';

const connection = await createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'employee_showcase',
});

const sql = `ALTER TABLE \`honors\` MODIFY COLUMN \`category\` varchar(100) NOT NULL DEFAULT '班组之星';`;

try {
  await connection.execute(sql);
  console.log('Migration executed successfully');
} catch (error) {
  console.error('Migration failed:', error);
}

await connection.end();
