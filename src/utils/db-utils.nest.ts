import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { Module } from '@nestjs/common';

export interface IDbModuleParams {
  driver: 'postgres' | 'mysql';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  models: ModelCtor[];
}

export const getDbProviders = (dbConfigs: IDbModuleParams[], sync = false) => {
  return dbConfigs.map((config) => ({
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: config.driver,
        ...config,
      });
      sequelize.addModels(config.models);
      sync &&
        (await sequelize
          .sync
          // Uncomment if you need to clean up and initialize all DB models from scratch
          // { force: true }
          ());

      return sequelize;
    },
  }));
};

export const getDbModule = (
  dbModuleParams: IDbModuleParams[],
  sync = false,
) => {
  const providers = getDbProviders(dbModuleParams, sync);
  @Module({
    providers: providers,
    exports: providers,
  })
  class DatabaseModule {}

  return DatabaseModule;
};
