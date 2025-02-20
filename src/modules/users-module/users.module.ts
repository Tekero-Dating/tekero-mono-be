import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from '../../contracts/db/models/user.entity';
import { ClientsModule } from '@nestjs/microservices';
import { generateRmqOptions } from '../../utils/rmq-utils.nest';
import {
  USERS_MODULE_QUEUES,
  USERS_SERVICE_NAME,
} from '../../contracts/users-interface/users.constants';
import { UserStatsRepository } from '../../contracts/db/models/user-stats.entity';
import { UserProfileRepository } from '../../contracts/db/models/user-profile.entity';
import { UserSettingsRepository } from '../../contracts/db/models/user-settings.entity';
import { getDbModule } from '../../utils/db-utils.nest';
import { dbOpts } from '../../config/config';
import { SessionsRepository } from '../../contracts/db/models/sessions.entity';

@Module({
  imports: [
    ClientsModule.register(
      generateRmqOptions(USERS_MODULE_QUEUES, USERS_SERVICE_NAME),
    ),
    getDbModule([dbOpts], false),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    UserStatsRepository,
    UserProfileRepository,
    UserSettingsRepository,
    SessionsRepository,
  ],
})
export class UsersModule {}
