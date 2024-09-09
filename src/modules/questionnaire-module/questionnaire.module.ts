import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { generateRmqOptions } from '../../utils/rmq-utils.nest';
import { QuestionnaireController } from './questionnaire.controller';
import { QuestionnaireService } from './questionnaire.service';
import {
  QUESTIONNAIRE_MODULE_QUEUES,
  QUESTIONNAIRE_SERVICE_NAME,
} from '../../contracts/questionnaire-interface/questionnaire.constants';
import { QuestionnaireRepository } from '../../contracts/db/models/questionnaire.entity';
import { QuestionnaireStepsRepository } from '../../contracts/db/models/questionnaire-steps.entity';

@Module({
  imports: [
    ClientsModule.register(
      generateRmqOptions(
        QUESTIONNAIRE_MODULE_QUEUES,
        QUESTIONNAIRE_SERVICE_NAME
      )
    )
  ],
  controllers: [
    QuestionnaireController
  ],
  providers: [
    QuestionnaireService,
    QuestionnaireRepository,
    QuestionnaireStepsRepository
  ],
})
export class QuestionnaireModule {}
