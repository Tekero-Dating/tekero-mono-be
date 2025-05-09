import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createRmqMicroservices } from './utils/rmq-utils.nest';
import { APP_PORT, generalRmqOpts } from './config/config';
import { ValidationPipe } from '@nestjs/common';
import { ADS_MODULE_QUEUES } from './contracts/ads-interface/ads.constants';
import { USER_PROFILES_MODULE_QUEUES } from './contracts/uesr-profiles-interface/user-profiles.constants';
import { QUESTIONNAIRE_MODULE_QUEUES } from './contracts/questionnaire-interface/questionnaire.constants';
import { MEDIA_MODULE_QUEUES } from './contracts/media-interface/media.constants';
import cookieParser from 'cookie-parser';
import { LIKES_MODULE_QUEUES } from './contracts/likes-interface/likes.constants';
import { USERS_MODULE_QUEUES } from './contracts/users-interface/users.constants';
import { CHAT_MODULE_QUEUES } from './contracts/chats-interface/chats.constants';
import cors from 'cors';
import { NOTIFICATIONS_MODULE_QUEUES } from './contracts/notifications-interface/notifications.constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { USER_STATS_MODULE_QUEUES } from './contracts/user-stats-interface/user-stats.constants';

global.crypto = crypto; // TODO nest/schedule of version 5 sucks very hard
export {
  // @ts-ignore
  bootstrap,
};

/* istanbul ignore next Use forktTs */
if (require.main === module) bootstrap();

// @ts-ignore
export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await createRmqMicroservices(
    app,
    [
      ...ADS_MODULE_QUEUES,
      ...USER_PROFILES_MODULE_QUEUES,
      ...QUESTIONNAIRE_MODULE_QUEUES,
      ...MEDIA_MODULE_QUEUES,
      ...LIKES_MODULE_QUEUES,
      ...USERS_MODULE_QUEUES,
      ...CHAT_MODULE_QUEUES,
      ...NOTIFICATIONS_MODULE_QUEUES,
      ...USER_STATS_MODULE_QUEUES,
    ],
    generalRmqOpts,
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(cookieParser());
  app.use(cors());
  const config = new DocumentBuilder()
    .setTitle('Tekero API')
    .setDescription('API documentation for Tekero dating app')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.startAllMicroservices();
  console.log('bootstrap', new Date().toISOString(), process.pid, __filename);
  await app.listen(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    +process.env.APP_PORT! || 3000,
    process.env.APP_HOST || 'localhost',
  );
  return app;
  // const api = app.get(QuestionnaireController);
  // await api.getQuestionnaire({ userId: 6 }, RmqContext as unknown as RmqContext);
}
