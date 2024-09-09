import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { generateRmqOptions } from '../../utils/rmq-utils.nest';
import {
  USER_PROFILES_MODULE_QUEUES,
  USER_PROFILES_SERVICE_NAME,
} from '../../contracts/uesr-profiles-interface/user-profiles.constants';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { UserProfileRepository } from '../../contracts/db/models/user-profile.entity';
import { UserRepository } from '../../contracts/db/models/user.entity';

@Module({
  imports: [
    ClientsModule.register(
      generateRmqOptions(USER_PROFILES_MODULE_QUEUES, USER_PROFILES_SERVICE_NAME)
    )
  ],
  controllers: [
    ProfilesController
  ],
  providers: [
    ProfilesService,
    UserProfileRepository,
    UserRepository
  ],
})
export class ProfilesModule {}
