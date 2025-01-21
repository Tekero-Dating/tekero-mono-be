import { Controller, Inject, Logger } from '@nestjs/common';
import {
  ILikeAd,
  ILikesController, IMatchAd,
  IUnlikeAd,
  LIKES_MSG_PATTERNS,
} from '../../contracts/likes-interface/likes.api-interface';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { LikesService } from './likes.service';
import { LIKES_SERVICE_NAME } from '../../contracts/likes-interface/likes.constants';

@Controller('likes')
export class LikesController implements ILikesController {
  private readonly logger = new Logger(LikesController.name);
  constructor (
    private readonly likesService: LikesService,
    @Inject(LIKES_SERVICE_NAME) private client: ClientProxy
  ) {}

  @MessagePattern(LIKES_MSG_PATTERNS.SEND_LIKE)
  async sendLike(
    @Payload() payload: ILikeAd.Request,
  ): Promise<ILikeAd.Response> {
    try {
      const { userId, advertisementId } = payload;
      const { like, stats: user_stats } = await this.likesService.sendLike(userId, advertisementId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error
      }
    }
  }

  @MessagePattern((LIKES_MSG_PATTERNS.DISMISS_LIKE))
  async dismissLike(
    @Payload() payload: IUnlikeAd.Request
  ): Promise<IUnlikeAd.Response> {
    try {
      const { userId, advertisementId } = payload;
      await this.likesService.dismissLike(userId, advertisementId);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error
      }
    }
  };

  @MessagePattern(LIKES_MSG_PATTERNS.MATCH)
  async makeMatch(

  ): Promise<IMatchAd.Response> {
    return { success: true };
  }
}
