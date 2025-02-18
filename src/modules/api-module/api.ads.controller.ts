import {
  BadRequestException,
  Body,
  Controller, Delete, Get,
  Inject,
  Param,
  Post, Put, Request,
  Res, UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ADS_SERVICE_NAME } from '../../contracts/ads-interface/ads.constants';
import { ClientProxy } from '@nestjs/microservices';
import { CreateAdvDTO, EditAdvDTO } from '../../contracts/ads-interface/ads.api.dto';
import { TekeroError } from '../../utils/error-handling-utils';
import { rmqSend } from '../../utils/rmq-utils.nest';
import { ADS_MSG_PATTERNS, ICreateAdv, IEditAdv } from '../../contracts/ads-interface/ads.api-interface';
import { JwtAuthGuard } from '../../utils/jwt.auth-guard';
import { JwtReq } from '../../utils/auth.jwt.strategy';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Advertisements')
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

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async createAd(
    @Body() payload: CreateAdvDTO,
    @Request() req: JwtReq,
    @Res() res
  ) {
    const { userId } = req.user;
    if (!Object.keys(payload).length) {
      const { status, message } = TekeroError(new BadRequestException('There are nothing to update'));
      return res.status(status).send({ success: false, error: { status, message } });
    }

    await rmqSend<ICreateAdv.Request, ICreateAdv.Response>(
      this.client,
      ADS_MSG_PATTERNS.CREATE,
      { fields: payload, userId },
      ({ success, result, error }) => {
        if (success) {
          return res.status(201).send({ success, result });
        } else {
          const { status, message } = TekeroError(error);
          return res.status(status).send({ success, error: { status, message } });
        }
      }
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('edit/:advId')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async editAd(
    @Param('advId') advId: number,
    @Body() payload: EditAdvDTO,
    @Request() req: JwtReq,
    @Res() res
  ) {
    const { userId } = req.user;
    if (!Object.keys(payload).length) {
      const { status, message } = TekeroError(new BadRequestException('There are nothing to update'));
      return res.status(status).send({ success: false, error: { status, message } });
    }

    await rmqSend<IEditAdv.Request, IEditAdv.Response>(
      this.client,
      ADS_MSG_PATTERNS.EDIT,
      { fields: payload, advId, userId },
      ({ success, result, error }) => {
        if (success) {
          return res.status(200).send({ success, result });
        } else {
          const { status, message } = TekeroError(error);
          return res.status(status).send({ success, error: { status, message } });
        }
      }
    )
  }

  @UseGuards(JwtAuthGuard)
  @Post('publish/:advId')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async publishAdvertisement(
    @Param('advId') advId: number,
    @Request() req: JwtReq,
    @Res() res
  ) {
    const { userId } = req.user;
    await rmqSend(
      this.client,
      ADS_MSG_PATTERNS.ACTIVATE_ADV,
      { userId, advId },
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
  @Delete('archive/:advId')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async archiveAdvertisement(
    @Param('advId') advId: number,
    @Request() req: JwtReq,
    @Res() res
  ) {
    const { userId } = req.user;
    await rmqSend(
      this.client,
      ADS_MSG_PATTERNS.ARCHIVE,
      { userId, advId },
      ({ success, result, error }) => {
        if (success) {
          return res.status(200).send({ success, result });
        } else {
          const { status, message } = TekeroError(error);
          return res.status(status).send({ success, error: { status, message } });
        }
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('suitable-advertisements')
  async getSuitableAdvertisements(
    @Body() payload,
    @Request() req: JwtReq,
    @Res() res
  ) {}
}
