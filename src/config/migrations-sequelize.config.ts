import { Dialect } from 'sequelize';
import dotenv from 'dotenv';
import { DB_MODELS } from '../contracts/db/models/models.enum';
import * as process from 'node:process';

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});

console.log(`.env.${process.env.NODE_ENV}`);
const sequelize = {
  [process.env.NODE_ENV as string]: {
    dialect: 'postgres' as Dialect,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    models: DB_MODELS,
    migrationStorage: 'sequelize',
    migrationStorageTableName: 'migrations',
    seederStorage: 'sequelize',
    seederStorageTableName: 'seeders',
  },
};

module.exports = sequelize;
