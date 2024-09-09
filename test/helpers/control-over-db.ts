import { Sequelize } from 'sequelize-typescript';

export class SuperSequelize {
  dbOpts;
  databaseName;
  sequelize

  constructor (dbOpts: {
    username: string;
    password: string;
    database: string;
    host: string;
    post: number;
    databaseName: string;
  } | any) {
    this.dbOpts = {
      ...dbOpts,
      database: ''
    };
    this.databaseName = dbOpts.databaseName;
    this.sequelize = new Sequelize(
      '',
      this.dbOpts.username,
      this.dbOpts.password,
      {
        host: this.dbOpts.host,
        port: this.dbOpts.port,
        dialect: 'postgres',
        logging: false,
      }
    );
  }

  async createDatabase(name: string) {
    try {
      await this.sequelize.query(`CREATE DATABASE "${name}"`);
      console.log(`Database ${name} created successfully.`);
    } catch (error) {
      console.error(`Error creating database: ${error.message}`);
    }
  }

  async dropDatabase(name: string) {
    try {
      await this.sequelize.query(`DROP DATABASE IF EXISTS "${name}"`);
      console.log(`Database ${name} dropped successfully.`);
    } catch (error) {
      console.error(`Error dropping database: ${error.message}`);
    }
  }

  async close() {
    await this.sequelize.close();
  }
}
