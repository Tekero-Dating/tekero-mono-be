import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { generateRmqOptions } from '../../utils/rmq-utils.nest';
import { LIKES_MODULE_QUEUES, LIKES_SERVICE_NAME } from '../../contracts/likes-interface/likes.constants';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { LikeRepository } from '../../contracts/db/models/like.entity';
import { UserStatsRepository } from '../../contracts/db/models/user-stats.entity';

@Module({
  imports: [
    ClientsModule.register(
      generateRmqOptions(LIKES_MODULE_QUEUES, LIKES_SERVICE_NAME)
    )
  ],
  controllers: [
    LikesController
  ],
  providers: [
    LikesService,
    LikeRepository,
    UserStatsRepository
  ]
})
export class LikesModule {}
