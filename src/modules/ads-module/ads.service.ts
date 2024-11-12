import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MODELS_REPOSITORIES_ENUM } from '../../contracts/db/models/models.enum';
import { Advertisement } from '../../contracts/db/models/advertisements.entity';
import { ICreateAdv, IEditAdv } from '../../contracts/ads-interface/ads.api-interface';
import { AdStatusesEnum } from '../../contracts/db/models/enums/ad-statuses.enum';
import { AdTypesEnum } from '../../contracts/db/models/enums/ad-types.enum';
import { AdvertisementMedia } from '../../contracts/db/models/junctions/advertisement-media.entity';
import { Media } from '../../contracts/db/models/mdeia.entity';
import { Op } from 'sequelize'
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class AdsService {
  private readonly logger = new Logger(AdsService.name);
  constructor(
    @Inject(MODELS_REPOSITORIES_ENUM.ADVERTISEMENTS)
    private advRepository: typeof Advertisement,
    @Inject(MODELS_REPOSITORIES_ENUM.MEDIA)
    private mediaRepository: typeof Media,
    @Inject(MODELS_REPOSITORIES_ENUM.ADVERTISEMENTS_MEDIA)
    private advMediaRepository: typeof AdvertisementMedia,
    @Inject('SEQUELIZE')
    private readonly sequelizeInstance: Sequelize
  ) {}

  /**
   *  Checks can if the current user illegible to attach
   *  these particular photos to his advertisement. Private
   *  photos can't be attached.
   */
  private async prepareMediaToAttach(mediaIds: number[] = [], userId: number) {
    this.logger.log('prepareMediaToAttach', { userId, mediaIds });
    const mediaToAttach: number[] = [];
    if (mediaIds && mediaIds.length) {
      const medias = await this.mediaRepository.findAll<Media['id']>({
        attributes: ['id'],
        where: {
          id: { [Op.in]: mediaIds },
          user_id: userId,
          private: false
        }
      });
      medias.forEach(media => {
        mediaToAttach.push(media.id)
      });
    }
    return mediaToAttach;
  }

  async createAd(
    userId: number,
    payload: ICreateAdv.Request['fields']
  ): Promise<Advertisement> {
    this.logger.log('createAd', { userId });
    const preConfiguredFields: Partial<Advertisement> = {
      status: AdStatusesEnum.DRAFT,
      type: AdTypesEnum.DATE,
      active: false,
      duration: (1000 * 3600) * 168
    };

    let adv;
    const mediaToAttach: number[] = await this.prepareMediaToAttach(payload.photos, userId);
    const transaction = await this.sequelizeInstance.transaction();
    const filter = payload.targetFilters;

    try {
      adv = await this.advRepository.create(
        { ...preConfiguredFields, ...payload, filter, user_id: userId },
        { transaction }
      );
      this.logger.log('createAd created advertisement');

      await this.advMediaRepository.bulkCreate<AdvertisementMedia>(
        mediaToAttach.map(mediaId => ({
          advertisementId: adv.id,
          mediaId
        })),
        { transaction }
      );
      this.logger.log('createAd attached media');
      await transaction.commit();
      return adv;
    } catch (error) {
      this.logger.error('createAd failed', error);
      await transaction.rollback();
      throw {
        message: 'Error during ad creation',
        status: 400
      };
    }
  }

  async editAd(
    userId: number,
    advId: number,
    payload: IEditAdv.Request['fields']
  ): Promise<Advertisement> {
    this.logger.log('editAd', { userId, advId });
    const originalAdv = await this.advRepository.findOne<Advertisement>({
      where: {
        id: advId,
        user_id: userId
      }
    });
    if (!originalAdv) {
      throw new NotFoundException('There is no advertisement with the given ID for the current user.')
    }

    let newAdvertisement = {
      ...originalAdv,
      ...payload,
      filter: {
        ...originalAdv.filter,
        ...payload.targetFilters
      }
    }

    try {
      const [numberOfAffectedRows, [updatedRecord]] = await this.advRepository.update(newAdvertisement, {
        where: { id: advId },
        returning: true
      });
      this.logger.log('editAd adv edited');

      if (numberOfAffectedRows) {
        return updatedRecord;
      } else {
        this.logger.error('editAd did not find any records to update', { userId, advId })
        throw new NotFoundException('Record not found or update failed');
      }
    } catch (e) {
      this.logger.error('editAd', { e, userId, advId, payload })
      throw new BadRequestException('Update failed');
    }
  }

  async publishAdv(userId: number, advId: number) {
    this.logger.log('publishAdv', { userId, advId });
    const advBelongedToUser = await this.advRepository.findOne({
      where: { id: advId, user_id: userId }
    });

    if (!advBelongedToUser) {
      this.logger.error('publishAdv not found adv');
      throw new NotFoundException('Advertisement not found');
    }

    try {
      await this.advRepository.update({
        status: AdStatusesEnum.ACTIVE,
        active: true,
        activated: Date.now()
      }, {
        where: { id: advId }
      });
      return;
    } catch (error) {
      this.logger.error('publishAdv', error);
      throw new InternalServerErrorException('Can not activate advertisement');
    }
  }

  async archiveAdv(userId: number, advId: number) {
    this.logger.log('archiveAdv', { userId, advId });
    const advBelongedToUser = await this.advRepository.findOne({
      where: { id: advId, user_id: userId }
    });

    if (!advBelongedToUser) {
      this.logger.error('archiveAdv not found adv');
      throw new NotFoundException('Advertisement not found');
    }

    try {
      await this.advRepository.update({
        status: AdStatusesEnum.ARCHIVED,
        active: false
      }, {
        where: { id: advId }
      });
      return;
    } catch (error) {
      this.logger.error('archiveAdv', { error, userId, advId });
      throw new InternalServerErrorException('Can not archive advertisement');
    }
  }
}
