import { Body, Controller, Get, Inject, Logger, Param, Post, Res, Request,UseGuards } from '@nestjs/common';
import { QUESTIONNAIRE_SERVICE_NAME } from '../../contracts/questionnaire-interface/questionnaire.constants';
import { ClientProxy } from '@nestjs/microservices';
import { TekeroError } from '../../utils/error-handling-utils';
import { rmqSend } from '../../utils/rmq-utils.nest';
import {
  IGetQuestionnaire, ISubmitQuestionByShortcode,
  QUESTIONNAIRE_MSG_PATTERNS,
} from '../../contracts/questionnaire-interface/questionnaire.api-interface';
import { JwtAuthGuard } from '../../utils/jwt.auth-guard';
import { JwtReq } from '../../utils/auth.jwt.strategy';

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
  async onApplicationShutdown(signal?: string) {
    await this.client.close();
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-questionnaire')
  async getQuestionnaire(
    @Request() req: JwtReq,
    @Res() res
  ) {
    const { userId } = req.user;
    this.logger.log(`API request getQuestionnaire`);
    rmqSend<IGetQuestionnaire.Request, IGetQuestionnaire.Response>(
      this.client,
      QUESTIONNAIRE_MSG_PATTERNS.GET_QUESTIONNAIRE,
      { userId },
      ({ success, result, error }) => {
        if (success) {
          return res.status(200).send({ success, result });
        } else {
          const { status, message } = TekeroError(error);
          this.logger.error({ status, message });
          return res.status(status).send({ success: false, error: { status, message } });
        }
      }
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit-question')
  async submitQuestion(
    @Request() req: JwtReq,
    @Body() body: ISubmitQuestionByShortcode.Request['response'],
    @Res() res
  ) {
    const { userId } = req.user;
    this.logger.log(`API request getQuestionnaire`);
    rmqSend<ISubmitQuestionByShortcode.Request, ISubmitQuestionByShortcode.Response>(
      this.client,
      QUESTIONNAIRE_MSG_PATTERNS.SUBMIT_QUESTIONNAIRE,
      { userId, response: body },
      ({ success, result, error }) => {
        if (success) {
          return res.status(200).send({ success, result });
        } else {
          const { status, message } = TekeroError(error);
          this.logger.error({ status, message });
          return res.status(status).send({ success, error: { status, message } });
        }
      }
    );
  }
}
