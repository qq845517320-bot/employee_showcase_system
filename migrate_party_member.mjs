import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

try {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  // Execute the migration
  await connection.execute(
    'ALTER TABLE `employees` ADD COLUMN IF NOT EXISTS `isPartyMember` boolean DEFAULT false NOT NULL'
  );
  
  console.log("✅ Migration successful: isPartyMember column added to employees table");
  await connection.end();
  process.exit(0);
} catch (error) {
  console.error("❌ Migration failed:", error.message);
  process.exit(1);
}
