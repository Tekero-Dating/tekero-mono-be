import {
  BadRequestException,
  Body,
  Controller, Delete, Get,
  Inject,
  Param,
  Post, Put,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ADS_SERVICE_NAME } from '../../contracts/ads-interface/ads.constants';
import { ClientProxy } from '@nestjs/microservices';
import { CreateAdvDTO, EditAdvDTO } from '../../contracts/ads-interface/ads.api.dto';
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

  async onApplicationShutdown(signal?: string) {
    await this.client.close();
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
          return res.status(201).send(result);
        } else {
          const { status, message } = TekeroError(error);
          res.status(status).send(message);
        }
      }
    )
  }

  @Put('edit/:userId/:advId')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async editAd(
    @Param('advId') advId: number,
    @Param('userId') userId: number,
    @Body() payload: EditAdvDTO,
    @Res() res
  ) {
    if (!Object.keys(payload).length) {
      const { status, message } = TekeroError(new BadRequestException('There are nothing to update'));
      res.status(status).send(message);
    }

    rmqSend<IEditAdv.Request, IEditAdv.Response>(
      this.client,
      ADS_MSG_PATTERNS.EDIT,
      { fields: payload, advId, userId },
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

  @Post('publish/:userId/:advId')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async publishAdvertisement(
    @Param('advId') advId: number,
    @Param('userId') userId: number,
    @Res() res
  ) {
    rmqSend(
      this.client,
      ADS_MSG_PATTERNS.ACTIVATE_ADV,
      { userId, advId },
      ({ success, result, error }) => {
        if (success) {
          return res.status(200).send(result);
        } else {
          const { status, message } = TekeroError(error);
          res.status(status).send(message);
        }
      },
    );
  }

  @Delete('archive/:userId/:advId')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async archiveAdvertisement(
    @Param('advId') advId: number,
    @Param('userId') userId: number,
    @Res() res
  ) {
    rmqSend(
      this.client,
      ADS_MSG_PATTERNS.ARCHIVE,
      { userId, advId },
      ({ success, result, error }) => {
        if (success) {
          return res.status(200).send(result);
        } else {
          const { status, message } = TekeroError(error);
          res.status(status).send(message);
        }
      },
    );
  }

  @Get('suitable-advertisements/:userId')
  async getSuitableAdvertisements(
    @Param('userId') userId: number,
    @Body() payload,
    @Res() res
  ) {

  }
}
