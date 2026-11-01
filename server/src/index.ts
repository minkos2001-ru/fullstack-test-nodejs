import "dotenv/config";
import "reflect-metadata";

import { ConnectionRefusedError } from "sequelize";
import sequelize from "./db/sequelize";
import config from "./config";
import app from "./app";

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    await sequelize.sync();

    const server = app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });

    server.on("error", (error) => {
      console.error("HTTP server error:", error);
    });

    server.on("close", () => {
      console.log("HTTP server closed");
    });

    console.log("HTTP server listening:", server.listening);
  } catch (error) {
    if (error instanceof ConnectionRefusedError) {
      console.error(
        `PostgreSQL is not available at ${config.database.host}:${config.database.port}`,
      );
    } else {
      console.error("Error starting server:", error);
    }

    process.exitCode = 1;
  }
}

startServer();
