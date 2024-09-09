import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Param,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ADS_SERVICE_NAME } from '../../contracts/ads-interface/ads.constants';
import { ClientProxy } from '@nestjs/microservices';
import { CreateAdvDTO } from '../../contracts/api-interface/api.dto';
import { TekeroError } from '../../utils/error-handling-utils';
import { rmqSend } from '../../utils/rmq-utils.nest';
import { ADS_MSG_PATTERNS, ICreateAdv, IEditAdv } from '../../contracts/ads-interface/ads.api-interface';

@Controller('api/ads')
export class ApiAdsController {
  constructor (
    @Inject(ADS_SERVICE_NAME)
    private readonly client: ClientProxy
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  @Post('create/:userId')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async createAd(
    @Param('userId') userId: number,
    @Body() payload: CreateAdvDTO,
    @Res() res
  ) {
    if (!Object.keys(payload).length) {
      const { status, message } = TekeroError(new BadRequestException('There are nothing to update'));
      res.status(status).send(message);
    }

    rmqSend<ICreateAdv.Request, ICreateAdv.Response>(
      this.client,
      ADS_MSG_PATTERNS.CREATE,
      { fields: payload, userId },
      ({ success, result, error }) => {
        if (success) {
          return res.status(200).send(result);
        } else {
          const { status, message } = TekeroError(error);
          res.status(status).send(message);
        }
      }
    )
  }

  @Post('edit/:advId')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async editAd(
    @Param('advId') advId: number,
    @Body() payload: CreateAdvDTO,
    @Res() res
  ) {
    if (!Object.keys(payload).length) {
      const { status, message } = TekeroError(new BadRequestException('There are nothing to update'));
      res.status(status).send(message);
    }

    rmqSend<IEditAdv.Request, IEditAdv.Response>(
      this.client,
      ADS_MSG_PATTERNS.EDIT,
      { fields: payload, advId },
      ({ success, result, error }) => {
        if (success) {
          return res.status(200).send(result);
        } else {
          const { status, message } = TekeroError(error);
          res.status(status).send(message);
        }
      }
    )
  }
}
