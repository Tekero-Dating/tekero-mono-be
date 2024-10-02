import { bootstrap } from '../../src/main';
import { INestApplication } from '@nestjs/common';
import * as bodyParser from 'body-parser';

let App: INestApplication;
export const getApp =  async () => {
  console.log('GETAPP started');
  if (!App) {
    console.log('GETAPP: app is not initialised, init and return new instance');
    App = await bootstrap();
    await App.init();
    App.use(bodyParser.json());
  }
  return App;
};

export const closeApp = async (): Promise<void> => {
  console.log('CLOSEAPP');
  if (App) {
    await App.close();
    // @ts-ignore
    App = null;
  }
};
