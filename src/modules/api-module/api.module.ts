import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { UserRepository } from '../../contracts/db/models/user.entity';
import { ClientsModule } from '@nestjs/microservices';
import { generateRmqOptions } from '../../utils/rmq-utils.nest';
import { API_MODULE_QUEUES, API_SERVICE_NAME } from '../../contracts/api-interface/api.constants';
import { ApiUserProfileController } from './api.user-profile.controller';
import {
  USER_PROFILES_MODULE_QUEUES,
  USER_PROFILES_SERVICE_NAME,
} from '../../contracts/uesr-profiles-interface/user-profiles.constants';
import { ADS_MODULE_QUEUES, ADS_SERVICE_NAME } from '../../contracts/ads-interface/ads.constants';
import { ApiAdsController } from './api.ads.controller';
import { ApiQuestionnaireController } from './api.questionnaire.controller';
import {
  QUESTIONNAIRE_MODULE_QUEUES,
  QUESTIONNAIRE_SERVICE_NAME,
} from '../../contracts/questionnaire-interface/questionnaire.constants';
import { MediaService } from '../media-module/media.service';
import { MediaRepository } from '../../contracts/db/models/mdeia.entity';
import { ApiMediaController } from './api.media.controller';
import { S3Service } from '../media-module/s3.service';
import { MEDIA_MODULE_QUEUES, MEDIA_SERVICE_NAME } from '../../contracts/media-interface/media.constants';
import { MediaAccessRepository } from '../../contracts/db/models/mdeia-access.entity';
import { ApiLikesController } from './api.likes.controller';
import { LIKES_MODULE_QUEUES, LIKES_SERVICE_NAME } from '../../contracts/likes-interface/likes.constants';
import { USERS_MODULE_QUEUES, USERS_SERVICE_NAME } from '../../contracts/users-interface/users.constants';
import { ApiUsersController } from './api.users.controller';

@Module({
  imports: [
    ClientsModule.register(
      generateRmqOptions(API_MODULE_QUEUES, API_SERVICE_NAME)
    ),
    ClientsModule.register(
      generateRmqOptions(USER_PROFILES_MODULE_QUEUES, USER_PROFILES_SERVICE_NAME)
    ),
    ClientsModule.register(
      generateRmqOptions(ADS_MODULE_QUEUES, ADS_SERVICE_NAME)
    ),
    ClientsModule.register(
      generateRmqOptions(QUESTIONNAIRE_MODULE_QUEUES, QUESTIONNAIRE_SERVICE_NAME)
    ),
    ClientsModule.register(
      generateRmqOptions(MEDIA_MODULE_QUEUES, MEDIA_SERVICE_NAME)
    ),
    ClientsModule.register(
      generateRmqOptions(LIKES_MODULE_QUEUES, LIKES_SERVICE_NAME)
    ),
    ClientsModule.register(
      generateRmqOptions(USERS_MODULE_QUEUES, USERS_SERVICE_NAME)
    )
  ],
  controllers: [
    ApiController,
    ApiUserProfileController,
    ApiAdsController,
    ApiQuestionnaireController,
    ApiMediaController,
    ApiLikesController,
    ApiUsersController
  ],
  providers: [
    ApiService,
    MediaService,
    S3Service,
    UserRepository,
    MediaRepository,
    MediaAccessRepository
  ],
})
export class ApiModule {}
