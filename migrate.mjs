import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
});

const migrationSQL = `
ALTER TABLE \`playback_strategies\` MODIFY COLUMN \`displayMode\` enum('all','core_bones') NOT NULL;
ALTER TABLE \`showcase_backgrounds\` MODIFY COLUMN \`displayMode\` enum('all','core_bones') NOT NULL DEFAULT 'all';
ALTER TABLE \`honors\` ADD COLUMN \`category\` enum('班组之星','集团级奖项','公司级奖项') DEFAULT '班组之星' NOT NULL;
`;

try {
  const statements = migrationSQL.split(';').filter(s => s.trim());
  for (const statement of statements) {
    if (statement.trim()) {
      console.log('Executing:', statement.trim());
      await connection.execute(statement);
      console.log('✓ Success');
    }
  }
  console.log('\n✅ All migrations completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  if (error.message.includes('Duplicate column name')) {
    console.log('ℹ️ Category column already exists, skipping...');
  }
} finally {
  await connection.end();
}
