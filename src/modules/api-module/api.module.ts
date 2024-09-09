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
    )
  ],
  controllers: [
    ApiController,
    ApiUserProfileController,
    ApiAdsController,
    ApiQuestionnaireController
  ],
  providers: [
    ApiService,
    UserRepository
  ],
})
export class ApiModule {}
