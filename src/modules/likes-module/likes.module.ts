import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { generateRmqOptions } from '../../utils/rmq-utils.nest';
import {
  LIKES_MODULE_QUEUES,
  LIKES_SERVICE_NAME,
} from '../../contracts/likes-interface/likes.constants';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { LikeRepository } from '../../contracts/db/models/like.entity';
import { UserStatsRepository } from '../../contracts/db/models/user-stats.entity';
import { ChatRepository } from '../../contracts/db/models/chat.entity';
import { ChatUserRepository } from '../../contracts/db/models/chat-user.entity';
import { getDbModule } from '../../utils/db-utils.nest';
import { dbOpts } from '../../config/config';
import { AdvertisementsRepository } from '../../contracts/db/models/advertisements.entity';

@Module({
  imports: [
    ClientsModule.register(
      generateRmqOptions(LIKES_MODULE_QUEUES, LIKES_SERVICE_NAME),
    ),
    getDbModule([dbOpts], false),
  ],
  controllers: [LikesController],
  providers: [
    LikesService,
    LikeRepository,
    UserStatsRepository,
    ChatRepository,
    ChatUserRepository,
    AdvertisementsRepository,
  ],
})
export class LikesModule {}
