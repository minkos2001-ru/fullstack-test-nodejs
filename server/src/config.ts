const config = {
  database: {
    host: (process.env.POSTGRES_HOST as string) || "localhost",
    port: parseInt((process.env.POSTGRES_PORT as string) || "5432"),
    username: (process.env.POSTGRES_USER as string) || "postgres",
    password: process.env.POSTGRES_PASSWORD as string,
    database: process.env.POSTGRES_DATABASE as string,
  },
  env: (process.env.NODE_ENV as string) || "development",
  port: parseInt((process.env.PORT as string) || "3000", 10),
  client: {
    protocol: (process.env.CLIENT_PROTOCOL as string) || "http",
    host: (process.env.CLIENT_HOST as string) || "localhost",
    port: (process.env.CLIENT_PORT as string) || "3000",
  },
};

export default config;
