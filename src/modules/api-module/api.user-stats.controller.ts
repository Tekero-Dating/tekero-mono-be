import {
  Controller,
  Get,
  Inject,
  Request as Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { IGetUSerStats } from '../../contracts/user-stats-interface/user-stats.api-interface';
import {
  USER_STATS_MSG_PATTERNS,
  USER_STATS_SERVICE_NAME,
} from '../../contracts/user-stats-interface/user-stats.constants';
import { ClientProxy } from '@nestjs/microservices';
import { JwtReq } from '../../utils/auth.jwt.strategy';
import { rmqSend } from '../../utils/rmq-utils.nest';
import { TekeroError } from '../../utils/error-handling-utils';
import { JwtAuthGuard } from '../../utils/jwt.auth-guard';

@Controller('api/user-stats')
export class ApiUserStatsController {
  constructor(
    @Inject(USER_STATS_SERVICE_NAME)
    private readonly client: ClientProxy,
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }
  async onApplicationShutdown(signal?: string) {
    await this.client.close();
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-user-stats')
  async getUserStats(@Req() req: JwtReq, @Res() res) {
    const { userId } = req.user;
    await rmqSend<IGetUSerStats.Request, IGetUSerStats.Response>(
      this.client,
      USER_STATS_MSG_PATTERNS.GET,
      { userId },
      ({ success, result, error }) => {
        if (success) {
          console.log({ result });
          return res.status(200).send({ success, result });
        } else {
          const { status, message } = TekeroError(error);
          return res
            .status(status)
            .send({ success, error: { status, message } });
        }
      },
    );
  }

  async setActiveChatLimit(payload) {
    return { success: true };
  }

  async setLikesToSendLimit(payload) {
    return { success: true };
  }

  async setLikedToReceiveLimit(payload) {
    return { success: true };
  }
}
