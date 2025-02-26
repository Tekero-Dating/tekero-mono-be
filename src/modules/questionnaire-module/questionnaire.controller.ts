import { Controller, Inject, Logger } from '@nestjs/common';
import {
  IQuestionnaireController,
  QUESTIONNAIRE_MSG_PATTERNS,
} from '../../contracts/questionnaire-interface/questionnaire.api-interface';
import { QuestionnaireService } from './questionnaire.service';
import { QUESTIONNAIRE_SERVICE_NAME } from '../../contracts/questionnaire-interface/questionnaire.constants';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { TekeroError } from '../../utils/error-handling-utils';

@Controller('questionnaire')
export class QuestionnaireController implements IQuestionnaireController {
  private readonly logger = new Logger(QuestionnaireController.name);
  constructor(
    private readonly questionnaireService: QuestionnaireService,
    @Inject(QUESTIONNAIRE_SERVICE_NAME) private client: ClientProxy,
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }
  async onApplicationShutdown(signal?: string) {
    await this.client.close();
  }

  @MessagePattern(QUESTIONNAIRE_MSG_PATTERNS.GET_QUESTIONNAIRE)
  async getQuestionnaire(@Payload() data, @Ctx() context: RmqContext) {
    this.logger.log('getQuestionnaire Received request');
    const { userId } = data;
    try {
      const result = await this.questionnaireService.getQuestionnaire(userId);
      this.logger.log(`getQuestionnaire Request processes successfully`, {
        userId,
      });
      return {
        success: true,
        result,
      };
    } catch (e) {
      this.logger.error(e, { userId });
      return {
        success: false,
        error: TekeroError(e),
      };
    }
  }

  @MessagePattern(QUESTIONNAIRE_MSG_PATTERNS.SUBMIT_QUESTIONNAIRE)
  async submitQuestionByShortcode(@Payload() data, @Ctx() context: RmqContext) {
    const { userId, response } = data;
    this.logger.log('submitQuestionByShortcode Received request', { userId });
    try {
      const questionnaireStatus =
        await this.questionnaireService.submitQuestionByShortcode(
          userId,
          response,
        );
      this.logger.log(
        `submitQuestionByShortcode Request processes successfully`,
        { userId },
      );
      return {
        success: true,
        result: {
          questionnaireStatus,
        },
      };
    } catch (e) {
      this.logger.error('submitQuestionByShortcode', { e, userId, response });
      return {
        success: false,
        error: TekeroError(e)
      };
    }
  }
}
