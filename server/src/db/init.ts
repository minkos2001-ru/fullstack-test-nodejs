import "dotenv/config";
import fs from "fs";
import path from "path";
import sequelize from "./sequelize";

async function initDatabase() {
  try {
    await sequelize.authenticate();

    const sqlPath = path.join(__dirname, "init.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    await sequelize.query(sql);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

initDatabase();
