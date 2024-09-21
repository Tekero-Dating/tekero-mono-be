import { Sequelize } from 'sequelize-typescript';

export class SuperSequelize {
  dbOpts;
  sequelize

  constructor (dbOpts: {
    username: string;
    password: string;
    database: string;
    host: string;
    post: number;
  } | any) {
    this.dbOpts = dbOpts;
    this.sequelize = new Sequelize(
      this.dbOpts.database,
      this.dbOpts.username,
      this.dbOpts.password,
      {
        host: this.dbOpts.host,
        port: this.dbOpts.port,
        dialect: 'postgres',
        logging: false
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

  async dropDbToWhichConnected(): Promise<boolean> {
    await this.close();
    const AdminDB  = new Sequelize(
      'postgres',
      this.dbOpts.username,
      this.dbOpts.password,
      {
        host: this.dbOpts.host,
        port: this.dbOpts.port,
        dialect: 'postgres',
        logging: false,
      }
    );

    const { database } = this.dbOpts;

    try {
      await AdminDB.query(
        `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${database}';`
      );
      await AdminDB
        .query(`DROP DATABASE IF EXISTS "${database}";`);
      console.log(`Database "${database}" dropped successfully.`);
      await AdminDB.close();
      return true
    } catch (error) {
      console.error(`Error dropping database "${database}":`, error);
      await AdminDB.close();
      return false;
    }
  }

  async close() {
    await this.sequelize.close();
  }
}
