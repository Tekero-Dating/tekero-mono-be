import {
  INMatch,
  INotificationsController,
  INReceiveLike,
} from '../../contracts/notifications-interface/notifications.api-interface';
import { Controller, Inject } from '@nestjs/common';
import {
  NOTIFICATIONS_MSG_PATTERNS,
  NOTIFICATIONS_SERVICE_NAME,
} from '../../contracts/notifications-interface/notifications.constants';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { TekeroError } from '../../utils/error-handling-utils';
import { ILikeAd } from '../../contracts/likes-interface/likes.api-interface';

@Controller('notifications')
export class NotificationsController implements INotificationsController {
  constructor(
    @Inject(NOTIFICATIONS_SERVICE_NAME) private client: ClientProxy,
    private readonly notificationsService: NotificationsService,
  ) {}

  @MessagePattern(NOTIFICATIONS_MSG_PATTERNS.LIKE_RECEIVED)
  async receiveLike(@Payload() payload: INReceiveLike.Request) {
    try {
      await this.notificationsService.notifyAdOwnerAboutLike(
        payload['0'].userId,
        payload['0'].advertisementId,
        payload.like.id,
      );
      return {
        success: true,
      };
    } catch (e) {
      return {
        success: false,
        error: TekeroError(e),
      };
    }
  }

  @MessagePattern(NOTIFICATIONS_MSG_PATTERNS.MATCH)
  async match(@Payload() payload: INMatch.Request): Promise<INMatch.Response> {
    try {
      await this.notificationsService.notifyLikeSenderAboutMatch(
        payload['0'].userId,
        payload['0'].likeId,
      );

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: TekeroError(error),
      };
    }
  }
}
