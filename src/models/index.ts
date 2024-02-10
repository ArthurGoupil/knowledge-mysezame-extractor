import { Sequelize } from "sequelize-typescript";
import { Items } from "./Items";
import { Templates } from "./Templates";
import { Categories } from "./Categories";

export const sequelize = new Sequelize(process.env.DB_URL ?? "", {
  dialectModule: require("mysql2"),
  models: [Items, Templates, Categories],
});
