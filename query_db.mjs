import { drizzle } from "drizzle-orm/mysql2";
import { honorCategories } from "./drizzle/schema.js";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const categories = await db.select().from(honorCategories);
console.log("honor_categories 表中的数据:");
console.table(categories);

await connection.end();
