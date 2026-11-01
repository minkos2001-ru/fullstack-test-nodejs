import express from "express";
import cors from "cors";

import bookRoutes from "./routes/book.routes";
import bookCategoryRoutes from "./routes/book-category.routes";
import config from "./config";

const app = express();

const clientOrigin = new URL(
  `${config.client.protocol}://${config.client.host}${
    config.client.port ? `:${config.client.port}` : ""
  }`,
).origin;
if (config.env == "development") {
  console.log("Allowed CORS origin:", clientOrigin);
}

app.use(
  cors({
    origin: clientOrigin,
  }),
);

app.use(express.json());

app.use("/api/books", bookRoutes);
app.use("/api/book-categories", bookCategoryRoutes);

export default app;
