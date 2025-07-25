import { Controller, Inject } from '@nestjs/common';
import {
  IGetUserLikes,
  ILikeAd,
  ILikesController,
  IMatchAd,
  IRejectLike,
  IUnlikeAd,
  LIKES_MSG_PATTERNS,
} from '../../contracts/likes-interface/likes.api-interface';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { LikesService } from './likes.service';
import { LIKES_SERVICE_NAME } from '../../contracts/likes-interface/likes.constants';
import { WithNotify } from '../../utils/with-notify';
import { NotificationTypesEnum } from '../../contracts/db/models/enums';
import { TekeroError } from '../../utils/error-handling-utils';

@Controller('likes')
export class LikesController implements ILikesController {
  constructor(
    private readonly likesService: LikesService,
    @Inject(LIKES_SERVICE_NAME) private client: ClientProxy,
  ) {}

  @MessagePattern(LIKES_MSG_PATTERNS.GET_USER_LIKES)
  async getUserLikes(@Payload() payload: IGetUserLikes.Request) {
    try {
      const { userId } = payload;
      const likes = await this.likesService.getUserLikes(userId);
      return {
        success: true,
        result: likes,
      };
    } catch (error) {
      return {
        success: false,
        error: TekeroError(error),
      };
    }
  }

  @MessagePattern(LIKES_MSG_PATTERNS.SEND_LIKE)
  @WithNotify(NotificationTypesEnum.LIKE_RECEIVED)
  async sendLike(
    @Payload() payload: ILikeAd.Request,
  ): Promise<ILikeAd.Response> {
    try {
      const { userId, advertisementId } = payload;
      const { like, stats: user_stats } = await this.likesService.sendLike(
        userId,
        advertisementId,
      );
      return {
        success: true,
        result: {
          like,
          user_stats: user_stats!,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: TekeroError(error),
      };
    }
  }

  @MessagePattern(LIKES_MSG_PATTERNS.DISMISS_LIKE)
  async dismissLike(
    @Payload() payload: IUnlikeAd.Request,
  ): Promise<IUnlikeAd.Response> {
    try {
      const { userId, advertisementId } = payload;
      await this.likesService.dismissLike(userId, advertisementId);
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

  @MessagePattern(LIKES_MSG_PATTERNS.REJECT_LIKE)
  @WithNotify(NotificationTypesEnum.LIKE_REJECTED)
  async rejectLike(
    @Payload() payload: IRejectLike.Request,
  ): Promise<IRejectLike.Response> {
    try {
      const { userId, likeId } = payload;
      await this.likesService.rejectLike(userId, likeId);
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

  @MessagePattern(LIKES_MSG_PATTERNS.MATCH)
  @WithNotify(NotificationTypesEnum.MATCH)
  async makeMatch(
    @Payload() payload: IMatchAd.Request,
  ): Promise<IMatchAd.Response> {
    try {
      const { userId, likeId } = payload;
      const { chat, author_stats, liker_stats } = await this.likesService.match(
        userId,
        likeId,
      );
      return {
        success: true,
        result: {
          chat,
          author_stats: author_stats!,
          liker_stats: liker_stats!,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: TekeroError(error),
      };
    }
  }
}
