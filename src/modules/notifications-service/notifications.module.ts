import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ClientsModule } from '@nestjs/microservices';
import { generateRmqOptions } from '../../utils/rmq-utils.nest';
import {
  NOTIFICATIONS_DELIVERY_SERVICE_NAME,
  NOTIFICATIONS_MODULE_QUEUES,
  NOTIFICATIONS_SERVICE_NAME,
} from '../../contracts/notifications-interface/notifications.constants';
import { NotificationRepository } from '../../contracts/db/models/notification.entity';
import { AdvertisementsRepository } from '../../contracts/db/models/advertisements.entity';
import { MessageRepository } from '../../contracts/db/models/message.entity';
import { PresenceService } from '../presence-service/presence.service';
import { RmqModule } from '../../utils/rmq-module/rmq.module';
import { RmqService } from '../../utils/rmq-module/rmq.service';

@Module({
  imports: [
    ClientsModule.register(
      generateRmqOptions([NOTIFICATIONS_MODULE_QUEUES[0]], NOTIFICATIONS_SERVICE_NAME)
    ),
    ClientsModule.register(
      generateRmqOptions([NOTIFICATIONS_MODULE_QUEUES[1]], NOTIFICATIONS_DELIVERY_SERVICE_NAME)
    ),
    RmqModule
  ],
  controllers: [
    NotificationsController
  ],
  providers: [
    NotificationsService,
    PresenceService,
    NotificationRepository,
    AdvertisementsRepository,
    MessageRepository,
    RmqService
  ]
})
export class NotificationsModule {}
