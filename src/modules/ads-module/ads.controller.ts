import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { AdsService } from './ads.service';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import {
  ADS_MSG_PATTERNS,
  IAdsController,
  IArchiveAdv,
  ICreateAdv,
  IEditAdv,
  IGetSuitableAds,
  IPublishAdv,
} from '../../contracts/ads-interface/ads.api-interface';
import { ADS_SERVICE_NAME } from '../../contracts/ads-interface/ads.constants';
import { TekeroError } from '../../utils/error-handling-utils';

@Controller('ads')
export class AdsController implements IAdsController {
  private readonly logger = new Logger(AdsController.name);
  constructor(
    private readonly addService: AdsService,
    @Inject(ADS_SERVICE_NAME) private client: ClientProxy,
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }
  async onApplicationShutdown(signal?: string) {
    await this.client.close();
  }

  @MessagePattern(ADS_MSG_PATTERNS.CREATE)
  async createAdv(
    @Payload() payload: ICreateAdv.Request,
    @Ctx() context: RmqContext,
  ): Promise<ICreateAdv.Response> {
    this.logger.log('createAdv Received request');
    try {
      const adv = await this.addService.createAd(
        payload.userId,
        payload.fields,
      );
      this.logger.log('createAdv Request processed successfully', {
        userId: payload.userId,
      });
      return {
        success: true,
        result: adv,
      };
    } catch (error) {
      this.logger.error('createAdv', { error, payload });
      return {
        success: false,
        error: TekeroError(error),
      };
    }
  }

  @MessagePattern(ADS_MSG_PATTERNS.EDIT)
  async editAdv(
    @Payload() payload: IEditAdv.Request,
    @Ctx() context: RmqContext,
  ): Promise<IEditAdv.Response> {
    this.logger.log('editAdv Received request');
    try {
      const adv = await this.addService.editAd(
        payload.userId,
        payload.advId,
        payload.fields,
      );
      this.logger.log('editAdv Request processed successfully', {
        userId: payload.userId,
      });
      return {
        success: true,
        result: adv,
      };
    } catch (error) {
      this.logger.error('editAdv', { error, payload });
      return {
        success: false,
        error: TekeroError(error),
      };
    }
  }

  @MessagePattern(ADS_MSG_PATTERNS.ACTIVATE_ADV)
  async publishAdv(
    @Payload() data: IPublishAdv.Request,
    @Ctx() context: RmqContext,
  ): Promise<IPublishAdv.Response> {
    this.logger.log('publishAdv request received');
    try {
      await this.addService.publishAdv(data.userId, data.advId);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: TekeroError(error),
      };
    }
  }

  @MessagePattern(ADS_MSG_PATTERNS.ARCHIVE)
  async archiveAdv(
    @Payload() data: IArchiveAdv.Request,
    @Ctx() context: RmqContext,
  ): Promise<IArchiveAdv.Response> {
    this.logger.log('archiveAdv request received');
    try {
      await this.addService.archiveAdv(data.userId, data.advId);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: TekeroError(error),
      };
    }
  }

  @MessagePattern(ADS_MSG_PATTERNS.SUIT_ADS)
  async getSuitableAdvertisements(
    @Payload() payload: IGetSuitableAds.Request,
    @Ctx() context,
  ) {
    const { userId, filters, location } = payload;
    try {
      const ads = await this.addService.getSuitableAds(
        userId,
        filters,
        location,
      );
      return { success: true, result: ads };
    } catch (error) {
      return { success: false, error: TekeroError(error) };
    }
  }
}
