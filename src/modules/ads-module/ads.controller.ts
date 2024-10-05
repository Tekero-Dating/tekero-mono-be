import { Controller, Get, Inject } from '@nestjs/common';
import { AdsService } from './ads.service';
import { ClientProxy, Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  ADS_MSG_PATTERNS,
  IAdsController, IArchiveAdv, ICreateAdv, IEditAdv, IGetAdvActivity,
} from '../../contracts/ads-interface/ads.api-interface';
import { Advertisement } from '../../contracts/db/models/advertisements.entity';
import { ADS_SERVICE_NAME } from '../../contracts/ads-interface/ads.constants';

@Controller('ads')
export class AdsController implements IAdsController{
  constructor(
    private readonly addService: AdsService,
    @Inject(ADS_SERVICE_NAME) private client: ClientProxy
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  async onApplicationShutdown(signal?: string) {
    await this.client.close();
  }

  @MessagePattern(ADS_MSG_PATTERNS.CREATE)
  async createAdv(
    @Payload() payload: ICreateAdv.Request, @Ctx() context: RmqContext
  ): Promise<ICreateAdv.Response> {
    try {
      const adv = await this.addService.createAd(payload.userId, payload.fields);
      return {
        success: true,
        result: adv
      }
    } catch (error) {
      return {
        success: false,
        error
      }
    }
  }

  @MessagePattern(ADS_MSG_PATTERNS.EDIT)
  async editAdv(@Payload() payload: IEditAdv.Request, @Ctx() context: RmqContext): Promise<IEditAdv.Response> {
    try {
      const adv = await this.addService.editAd(payload.advId, payload.fields);
      return {
        success: true,
        result: adv
      }
    } catch (error) {
      return {
        success: false,
        error
      }
    }
  }

  @MessagePattern(ADS_MSG_PATTERNS.ARCHIVE)
  async archiveAdv(@Payload() data: IArchiveAdv.Request, @Ctx() context: RmqContext): Promise<IArchiveAdv.Response> {
    return this.addService.getHello();
  }

  @MessagePattern(ADS_MSG_PATTERNS.ACTIVITY)
  async getAdvActivity(@Payload() data: IGetAdvActivity.Request, @Ctx() context: RmqContext): Promise<IGetAdvActivity.Response> {
    return this.addService.getHello();
  }

  @MessagePattern(ADS_MSG_PATTERNS.STATS)
  async getAdvStats(@Payload() data, @Ctx() context){
    return this.addService.getHello();
  }
}
