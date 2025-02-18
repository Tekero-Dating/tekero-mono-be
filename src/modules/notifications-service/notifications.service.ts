import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Advertisement } from '../../contracts/db/models/advertisements.entity';
import { MODELS_REPOSITORIES_ENUM } from '../../contracts/db/models/models.enum';
import { Notification } from '../../contracts/db/models/notification.entity';
import { NotificationTypesEnum } from '../../contracts/db/models/enums';
import { PresenceService } from '../presence-service/presence.service';
import { PresenceGateway } from '../presence-service/presence.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor (
    @Inject(MODELS_REPOSITORIES_ENUM.ADVERTISEMENTS)
    private advertisementRepository: typeof Advertisement,
    @Inject(MODELS_REPOSITORIES_ENUM.NOTIFICATION)
    private notificationRepository: typeof Notification,
    private readonly presenceService: PresenceService,
    @Inject(forwardRef(() => PresenceGateway)) private readonly presenceGateway: PresenceGateway,
  ) {}

  async notifyAdOwnerAboutLike(userId: number, advertisementId: number, likeId: number): Promise<void> {
    const context = { userId, advertisementId, likeId };
    this.logger.log('notifyAdOwnerAboutLike', { context });
    const advertisement = await this.advertisementRepository.findByPk(advertisementId);
    if (!advertisement) {
      this.logger.error('notifyAdOwnerAboutLike error, did not find ad.', { context });
      throw new NotFoundException(
        'Can not find the corresponding advertisement.'
      )
    }
    this.logger.log('notifyAdOwnerAboutLike: ad found', { context });
    const adOwnerId = advertisement.user_id;
    try {
      const notification = await this.notificationRepository.create({
        user_id: adOwnerId,
        payload: {
          likeId,
          advertisementId,
          userId
        },
        type: NotificationTypesEnum.LIKE_RECEIVED,
        acknowledged: false
      });
      this.logger.log('notifyAdOwnerAboutLike: created notification', { context });
      const isOnline = await this.presenceService.isOnline(adOwnerId);
      if (isOnline) {
        this.logger.log('notifyAdOwnerAboutLike: user online. Sending to the queue.', { context });
        await this.presenceGateway.sendInAppNotification({
          userId: adOwnerId,
          notificationId: notification.id
        });
      }
    } catch (error) {
      this.logger.error('notifyAdOwnerAboutLike: uncaught error', { error, context });
      throw new InternalServerErrorException('Can not send notification');
    }
  }
}
