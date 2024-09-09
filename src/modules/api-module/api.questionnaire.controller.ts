import { Controller, Get, Inject, Logger, Param, Res } from '@nestjs/common';
import { QUESTIONNAIRE_SERVICE_NAME } from '../../contracts/questionnaire-interface/questionnaire.constants';
import { ClientProxy } from '@nestjs/microservices';
import { TekeroError } from '../../utils/error-handling-utils';
import { rmqSend } from '../../utils/rmq-utils.nest';
import {
  IGetQuestionnaire,
  QUESTIONNAIRE_MSG_PATTERNS,
} from '../../contracts/questionnaire-interface/questionnaire.api-interface';

@Controller('api/questionnaire')
export class ApiQuestionnaireController {
  private readonly logger = new Logger(ApiQuestionnaireController.name);
  constructor (
    @Inject(QUESTIONNAIRE_SERVICE_NAME)
    private readonly client: ClientProxy
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  @Get('get-questionnaire/:userId')
  async getQuestionnaire(
    @Param('userId') userId: number,
    @Res() res
  ) {
    this.logger.log(`API request getQuestionnaire`);
    rmqSend<IGetQuestionnaire.Request, IGetQuestionnaire.Response>(
      this.client,
      QUESTIONNAIRE_MSG_PATTERNS.GET_QUESTIONNAIRE,
      { userId },
      ({ success, result, error }) => {
        if (success) {
          res.status(200).send(result);
        } else {
          const { status, message } = TekeroError(error);
          this.logger.error({ status, message });
          res.status(status).send(message);
        }
      }
    );
  }
}