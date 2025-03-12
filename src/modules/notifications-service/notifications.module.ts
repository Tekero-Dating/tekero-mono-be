import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ClientsModule } from '@nestjs/microservices';
import { generateRmqOptions } from '../../utils/rmq-utils.nest';
import {
  NOTIFICATIONS_MODULE_QUEUES,
  NOTIFICATIONS_SERVICE_NAME,
} from '../../contracts/notifications-interface/notifications.constants';
import { NotificationRepository } from '../../contracts/db/models/notification.entity';
import { AdvertisementsRepository } from '../../contracts/db/models/advertisements.entity';
import { MessageRepository } from '../../contracts/db/models/message.entity';
import { PresenceService } from '../presence-service/presence.service';
import { PresenceModule } from '../presence-service/presence.module';
import { LikeRepository } from '../../contracts/db/models/like.entity';

@Module({
  imports: [
    PresenceModule,
    ClientsModule.register(
      generateRmqOptions(
        [NOTIFICATIONS_MODULE_QUEUES[0]],
        NOTIFICATIONS_SERVICE_NAME,
      ),
    ),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    PresenceService,
    NotificationRepository,
    AdvertisementsRepository,
    MessageRepository,
    LikeRepository
  ],
})
export class NotificationsModule {}
