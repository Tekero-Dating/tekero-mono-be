import { bootstrap } from '../../src/main';
import { INestApplication } from '@nestjs/common';

let App: INestApplication;
export const getApp =  async () => {
  if (!App) {
    App = await bootstrap();
    await App.init();
  }
  return App;
};

export const closeApp = async (): Promise<void> => {
  if (App) {
    await App.close();
    // @ts-ignore
    App = null;
  }
};
