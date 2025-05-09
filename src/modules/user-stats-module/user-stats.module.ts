import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { generateRmqOptions } from '../../utils/rmq-utils.nest';
import { UserRepository } from '../../contracts/db/models/user.entity';
import {
  USER_STATS_MODULE_QUEUES,
  USER_STATS_SERVICE_NAME,
} from '../../contracts/user-stats-interface/user-stats.constants';
import { UserStatsController } from './user-stats.controller';
import { UserStatsService } from './user-stats.service';
import { UserStatsRepository } from '../../contracts/db/models/user-stats.entity';

@Module({
  imports: [
    ClientsModule.register(
      generateRmqOptions(USER_STATS_MODULE_QUEUES, USER_STATS_SERVICE_NAME),
    ),
  ],
  controllers: [UserStatsController],
  providers: [UserStatsService, UserStatsRepository, UserRepository],
})
export class UserStatsModule {}
