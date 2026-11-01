import { Sequelize } from "sequelize-typescript";
import { Options } from "sequelize";
import config from "../config";

const sequelizeOptions: Options = {
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  dialect: "postgres",
  logging: false,
};

const sequelize = new Sequelize({
  ...sequelizeOptions,
  models: [__dirname + "/../models"],
});
export default sequelize;
