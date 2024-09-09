import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createRmqMicroservices } from './utils/rmq-utils.nest';
import { APP_PORT, generalRmqOpts } from './config/config';
import { ValidationPipe } from '@nestjs/common';
import { ADS_MODULE_QUEUES } from './contracts/ads-interface/ads.constants';
import { USER_PROFILES_MODULE_QUEUES } from './contracts/uesr-profiles-interface/user-profiles.constants';
import { QUESTIONNAIRE_MODULE_QUEUES } from './contracts/questionnaire-interface/questionnaire.constants';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await createRmqMicroservices(app, [
    ...ADS_MODULE_QUEUES,
    ...USER_PROFILES_MODULE_QUEUES,
    ...QUESTIONNAIRE_MODULE_QUEUES
  ], generalRmqOpts);
  app.useGlobalPipes(new ValidationPipe());
  await app.startAllMicroservices();
  console.log('bootstrap', new Date().toISOString(), process.pid, __filename);
  await app.listen(+APP_PORT!);
  return app;
  // const api = app.get(QuestionnaireController);
  // await api.getQuestionnaire({ userId: 6 }, RmqContext as unknown as RmqContext);
}
bootstrap();
