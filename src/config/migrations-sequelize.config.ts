import { Dialect } from 'sequelize';
import dotenv from "dotenv";
import { DB_MODELS } from '../contracts/db/models/models.enum';

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`
})

const sequelize = {
  [process.env.NODE_ENV as string]: {
    dialect: 'postgres' as Dialect,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    models: DB_MODELS, // Adjust the path to your models,
    migrationStorage: "sequelize",
    migrationStorageTableName: "migrations",
    seederStorage: "sequelize",
    seederStorageTableName: "seeders"
  }
};

module.exports = sequelize;
