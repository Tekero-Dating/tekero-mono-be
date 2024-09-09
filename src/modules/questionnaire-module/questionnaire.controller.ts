import { Controller, Inject, Logger } from '@nestjs/common';
import {
  IQuestionnaireController,
  QUESTIONNAIRE_MSG_PATTERNS,
} from '../../contracts/questionnaire-interface/questionnaire.api-interface';
import { QuestionnaireService } from './questionnaire.service';
import { QUESTIONNAIRE_SERVICE_NAME } from '../../contracts/questionnaire-interface/questionnaire.constants';
import { ClientProxy, Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller('questionnaire')
export class QuestionnaireController implements IQuestionnaireController {
  private readonly logger = new Logger(QuestionnaireController.name);
  constructor (
    private readonly questionnaireService: QuestionnaireService,
    @Inject(QUESTIONNAIRE_SERVICE_NAME) private client: ClientProxy
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  @MessagePattern(QUESTIONNAIRE_MSG_PATTERNS.GET_QUESTIONNAIRE)
  async getQuestionnaire(@Payload() data, @Ctx() context: RmqContext) {
    this.logger.log('Received request');
    const { userId } = data;
    try {
      const result = await this.questionnaireService.getQuestionnaire(userId);
      return {
        success: true,
        result
      };
    } catch (e) {
      this.logger.error(e);
      return {
        success: false,
        error: e
      };
    }
  }

  @MessagePattern(QUESTIONNAIRE_MSG_PATTERNS.SUBMIT_QUESTIONNAIRE)
  async submitQuestionsByStepId(@Payload() data, @Ctx() context: RmqContext) {
    return {
      success: true
    };
  }
}
