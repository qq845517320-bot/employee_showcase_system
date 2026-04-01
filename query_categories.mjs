import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/').pop() || 'employee_showcase',
});

const [rows] = await connection.execute('SELECT * FROM honor_categories ORDER BY `order`');
console.log('honor_categories 表中的数据:');
console.table(rows);

await connection.end();
