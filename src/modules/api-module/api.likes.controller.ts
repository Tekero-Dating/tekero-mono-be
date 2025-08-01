import {
  Controller,
  Param,
  Post,
  Res,
  Request as Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Inject,
  Patch,
  Get,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../../utils/jwt.auth-guard';
import { JwtReq } from '../../utils/auth.jwt.strategy';
import { rmqSend } from '../../utils/rmq-utils.nest';
import {
  IRejectLike,
  LIKES_MSG_PATTERNS,
} from '../../contracts/likes-interface/likes.api-interface';
import { TekeroError } from '../../utils/error-handling-utils';
import { LIKES_SERVICE_NAME } from '../../contracts/likes-interface/likes.constants';

@Controller('api/like')
export class ApiLikesController {
  constructor(
    @Inject(LIKES_SERVICE_NAME)
    private readonly client: ClientProxy,
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }
  async onApplicationShutdown(signal?: string) {
    await this.client.close();
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-user-likes')
  async getUserLikes(@Req() req: JwtReq, @Res() res) {
    const { userId } = req.user;
    await rmqSend(
      this.client,
      LIKES_MSG_PATTERNS.GET_USER_LIKES,
      { userId },
      ({ success, result, error }) => {
        if (success) {
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

  @UseGuards(JwtAuthGuard)
  @Post('send-like/:advId')
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  async sendLike(
    @Param('advId') advertisementId: number,
    @Req() req: JwtReq,
    @Res() res,
  ) {
    const { userId } = req.user;
    await rmqSend(
      this.client,
      LIKES_MSG_PATTERNS.SEND_LIKE,
      { userId, advertisementId },
      ({ success, result, error }) => {
        if (success) {
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

  @UseGuards(JwtAuthGuard)
  @Post('dismiss-like/:advId')
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  async dismissLike(
    @Param('advId') advertisementId: number,
    @Req() req: JwtReq,
    @Res() res,
  ) {
    const { userId } = req.user;
    await rmqSend(
      this.client,
      LIKES_MSG_PATTERNS.DISMISS_LIKE,
      { userId, advertisementId },
      ({ success, result, error }) => {
        if (success) {
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

  @UseGuards(JwtAuthGuard)
  @Patch('reject-like/:likeId')
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  async rejectLike(
    @Param('likeId') likeId: number,
    @Req() req: JwtReq,
    @Res() res,
  ) {
    const { userId } = req.user;
    await rmqSend<IRejectLike.Request, IRejectLike.Response>(
      this.client,
      LIKES_MSG_PATTERNS.REJECT_LIKE,
      { userId, likeId },
      ({ success, error }) => {
        if (success) {
          return res.status(200).send({ success });
        } else {
          const { status, message } = error;
          return res
            .status(status)
            .send({ success, error: { status, message } });
        }
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('match/:likeId')
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  async match(@Param('likeId') likeId: number, @Req() req: JwtReq, @Res() res) {
    const { userId } = req.user;
    await rmqSend(
      this.client,
      LIKES_MSG_PATTERNS.MATCH,
      { userId, likeId },
      ({ success, result, error }) => {
        if (success) {
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
}
