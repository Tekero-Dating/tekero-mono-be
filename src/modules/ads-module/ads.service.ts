import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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


  getHello(): Promise<any> {
    return this.advRepository.findAll<Advertisement>();
  }

  private async prepareMediaToAttach(mediaIds: number[] = [], userId: number) {
    const mediaToAttach: number[] = [];
    if (mediaIds && mediaIds.length) {
      const medias = await this.mediaRepository.findAll<Media['id']>({
        attributes: ['id'],
        where: {
          id: { [Op.in]: mediaIds },
          user_id: userId
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
    const preConfiguredFields: Partial<Advertisement> = {
      status: AdStatusesEnum.DRAFT,
      type: AdTypesEnum.DATE,
      active: false,
      duration: 168
    };

    let adv;
    const mediaToAttach: number[] = await this.prepareMediaToAttach(payload.photos, userId);
    const transaction = await this.sequelizeInstance.transaction();

    try {
      adv = await this.advRepository.create(
        { ...preConfiguredFields, ...payload, user_id: userId },
        { transaction }
      );
      await this.advMediaRepository.bulkCreate<AdvertisementMedia>(
        mediaToAttach.map(mediaId => ({
          advertisementId: adv.id,
          mediaId
        })),
        { transaction }
      );
      await transaction.commit();
      return adv;
    } catch (error) {
      await transaction.rollback();
      throw {
        message: 'Error during ad creation',
        status: 400
      };
    }
  }

  async editAd(
    advId: number,
    payload: IEditAdv.Request['fields']
  ): Promise<Advertisement> {
    const [numberOfAffectedRows, [updatedRecord]] = await this.advRepository.update(payload, {
      where: { id: advId },
      returning: true
    });

    if (numberOfAffectedRows) {
      console.log({ numberOfAffectedRows });
      return updatedRecord;
    } else {
      // Handle the case where the record was not found or not updated
      throw new BadRequestException('Record not found or update failed');
    }
  }
}
