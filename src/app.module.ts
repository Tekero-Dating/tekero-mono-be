import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDbModule } from './utils/db-utils.nest';
import { dbOpts } from './config/config';
import { UserRepository } from './contracts/db/models/user.entity';
import { AdsModule } from './modules/ads-module/ads.module';
import { ApiModule } from './modules/api-module/api.module';
import { ProfilesModule } from './modules/profiles-module/profiles.module';
import { ExpensesModule } from './modules/expenses-module/expenses.module';
import { ActionsModule } from './modules/actions-module/actions.module';
import { QuestionnaireModule } from './modules/questionnaire-module/questionnaire.module';
import { MediaModule } from './modules/media-module/media.module';
import { AuthModule } from './modules/auth-module/auth.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsInterceptor } from './modules/metrics/metrics.interceptor';
import { LikesModule } from './modules/likes-module/likes.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './modules/users-module/users.module';
import { ChatModule } from './modules/chat-module/chat.module';
import { NotificationsModule } from './modules/notifications-service/notifications.module';
import { PresenceModule } from './modules/presence-service/presence.module';

@Module({
  imports: [
    getDbModule([dbOpts], true),
    ScheduleModule.forRoot(),
    AuthModule,
    ApiModule,
    ProfilesModule,
    UsersModule,
    AdsModule,
    ExpensesModule,
    ActionsModule,
    QuestionnaireModule,
    MediaModule,
    LikesModule,
    MetricsModule,
    ChatModule,
    PresenceModule,
    NotificationsModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
    UserRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor
    }
  ],
})
export class AppModule {}
