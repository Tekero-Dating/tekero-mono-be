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
import {
  IAdvFilters,
  ICreateAdv,
  IEditAdv,
} from '../../contracts/ads-interface/ads.api-interface';
import { AdStatusesEnum } from '../../contracts/db/models/enums/ad-statuses.enum';
import { AdTypesEnum } from '../../contracts/db/models/enums/ad-types.enum';
import { AdvertisementMedia } from '../../contracts/db/models/junctions/advertisement-media.entity';
import { Media } from '../../contracts/db/models/mdeia.entity';
import { col, literal, Op, QueryTypes, where } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  UserProfile,
  UserProfileRepository,
} from '../../contracts/db/models/user-profile.entity';
import { User } from '../../contracts/db/models/user.entity';
import {
  ConstitutionsEnum,
  GendersEnum,
} from '../../contracts/db/models/enums';
import { makeTuple } from '../../utils/make-tuple';

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
    @Inject(MODELS_REPOSITORIES_ENUM.USER_PROFILE)
    private userProfileRepository: typeof UserProfile,
    @Inject('SEQUELIZE')
    private readonly sequelizeInstance: Sequelize,
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
          private: false,
        },
      });
      medias.forEach((media) => {
        mediaToAttach.push(media.id);
      });
    }
    return mediaToAttach;
  }

  async createAd(
    userId: number,
    payload: ICreateAdv.Request['fields'],
  ): Promise<Advertisement> {
    this.logger.log('createAd', { userId });
    const preConfiguredFields: Partial<Advertisement> = {
      status: AdStatusesEnum.DRAFT,
      type: payload.type,
      active: false,
      duration: 1000 * 3600 * 168,
    };

    let adv;
    const mediaToAttach: number[] = await this.prepareMediaToAttach(
      payload.photos,
      userId,
    );
    const transaction = await this.sequelizeInstance.transaction();
    const filter = payload.targetFilters;
    const travelFields: {
      travels_to: { type: 'Point'; coordinates: [number, number] };
      travel_date_from: Date;
      travel_date_to: Date;
    } = {} as any;

    if (payload.type === AdTypesEnum.TRAVEL) {
      travelFields.travels_to = payload.travelsTo!;
      travelFields.travel_date_from = new Date(payload.travelDateFrom!);
      travelFields.travel_date_to = new Date(payload.travelDateTo!);
    }

    try {
      adv = await this.advRepository.create(
        {
          user_id: userId,
          ...preConfiguredFields,
          ...payload,
          filter,
          ...travelFields,
        },
        { transaction },
      );
      this.logger.log('createAd created advertisement');

      await this.advMediaRepository.bulkCreate<AdvertisementMedia>(
        mediaToAttach.map((mediaId) => ({
          advertisementId: adv.id,
          mediaId,
        })),
        { transaction },
      );
      this.logger.log('createAd attached media');
      await transaction.commit();
      return adv;
    } catch (error) {
      this.logger.error('createAd failed', error);
      await transaction.rollback();
      throw {
        message: 'Error during ad creation',
        status: 400,
      };
    }
  }

  async editAd(
    userId: number,
    advId: number,
    payload: IEditAdv.Request['fields'],
  ): Promise<Advertisement> {
    this.logger.log('editAd', { userId, advId });
    const originalAdv = await this.advRepository.findOne<Advertisement>({
      where: {
        id: advId,
        user_id: userId,
      },
    });
    if (!originalAdv) {
      throw new NotFoundException(
        'There is no advertisement with the given ID for the current user.',
      );
    }

    const travelFields: {
      travels_to: { type: 'Point'; coordinates: [number, number] };
      travel_date_from: Date;
      travel_date_to: Date;
    } = {} as any;

    if (payload.type === AdTypesEnum.TRAVEL) {
      travelFields.travels_to = payload.travelsTo!;
      travelFields.travel_date_from = new Date(payload.travelDateFrom!);
      travelFields.travel_date_to = new Date(payload.travelDateTo!);
    }

    const newAdvertisement = {
      ...originalAdv,
      ...payload,
      filter: {
        ...originalAdv.filter,
        ...payload.targetFilters,
      },
      ...travelFields,
    };

    try {
      const [numberOfAffectedRows, [updatedRecord]] =
        await this.advRepository.update(newAdvertisement, {
          where: { id: advId },
          returning: true,
        });
      this.logger.log('editAd adv edited');

      if (numberOfAffectedRows) {
        return updatedRecord;
      } else {
        this.logger.error('editAd did not find any records to update', {
          userId,
          advId,
        });
        throw new NotFoundException('Record not found or update failed');
      }
    } catch (e) {
      this.logger.error('editAd', { e, userId, advId, payload });
      throw new BadRequestException('Update failed');
    }
  }

  async publishAdv(userId: number, advId: number) {
    this.logger.log('publishAdv', { userId, advId });
    const advBelongedToUser = await this.advRepository.findOne({
      where: { id: advId, user_id: userId },
    });

    if (!advBelongedToUser) {
      this.logger.error('publishAdv not found adv');
      throw new NotFoundException('Advertisement not found');
    }

    try {
      await this.advRepository.update(
        {
          status: AdStatusesEnum.ACTIVE,
          active: true,
          activated: Date.now(),
        },
        {
          where: { id: advId },
        },
      );
      return;
    } catch (error) {
      this.logger.error('publishAdv', error);
      throw new InternalServerErrorException('Can not activate advertisement');
    }
  }

  async archiveAdv(userId: number, advId: number) {
    this.logger.log('archiveAdv', { userId, advId });
    const advBelongedToUser = await this.advRepository.findOne({
      where: { id: advId, user_id: userId },
    });

    if (!advBelongedToUser) {
      this.logger.error('archiveAdv not found adv');
      throw new NotFoundException('Advertisement not found');
    }

    try {
      await this.advRepository.update(
        {
          status: AdStatusesEnum.ARCHIVED,
          active: false,
        },
        {
          where: { id: advId },
        },
      );
      return;
    } catch (error) {
      this.logger.error('archiveAdv', { error, userId, advId });
      throw new InternalServerErrorException('Can not archive advertisement');
    }
  }

  async getSuitableAds(
    userId: number,
    filters: IAdvFilters,
    location: { type: 'Point'; coordinates: [number, number] },
  ): Promise<Advertisement[]> {
    const context = { userId, filters };
    this.logger.log('getSuitableAds', context);

    const distanceInMeters = filters.distance || 20000;
    const {
      coordinates: [lon, lat],
    } = location;

    const {
      gender,
      genderExpressionFrom,
      genderExpressionTo,
      ageFrom,
      ageTo,
      heightFrom,
      heightTo,
      constitution,
    } = filters;

    const genderClause =
      gender && gender.length ? `AND up.sex IN ${makeTuple(gender)}` : '';
    const genderExprClause =
      genderExpressionFrom != null && genderExpressionTo != null
        ? `AND up.gender_expression BETWEEN ${genderExpressionFrom} AND ${genderExpressionTo}`
        : '';
    const heightClause =
      heightFrom != null && heightTo != null
        ? `AND up.height BETWEEN ${heightFrom} AND ${heightTo}`
        : '';
    const constitutionClause =
      constitution && constitution.length
        ? `AND up.constitution IN ${makeTuple(constitution)}`
        : '';
    const ageClause =
      ageFrom != null && ageTo != null
        ? `AND u.dob BETWEEN
           (current_date - INTERVAL '${ageTo} years')
         AND (current_date - INTERVAL '${ageFrom} years')`
        : '';

    this.logger.log('getSuitableAds: filters prepared', context);

    // fetch the explorer's own profile for the mutual-filter pass
    const explorerUserProfile = await this.userProfileRepository.findOne({
      where: { id: userId },
      include: [
        {
          model: User,
          as: 'profile_owner',
          attributes: ['dob'],
          required: true,
        },
      ],
    });
    this.logger.log('getSuitableAds: got explorerUserProfile', context);
    if (!explorerUserProfile) {
      this.logger.error('getSuitableAds: not found user', context);
      throw new NotFoundException('User not found');
    }

    const sequelize = this.advRepository.sequelize;
    const adTable = Advertisement.getTableName();
    const profileTable = UserProfile.getTableName();
    const userTable = User.getTableName();

    const suitableAds: Advertisement[] = [];
    const pageSize = 10;
    let lastId = 0;
    let adsBatch: any[];

    this.logger.log('getSuitableAds: loop batch by batch', context);
    do {
      const sql = `
        SELECT
          a.*,
          u."firstName"                AS "firstName",
          u."lastName"                 AS "lastName",
          date_part('year', age(current_date, u.dob)) AS age,
          up.height                    AS height,
          up.weight                    AS weight,
          up.sex                       AS gender,
          up.orientation               AS orientation,
          up.constitution              AS constitution,
--         up.languages                 AS languages, // TODO: add languages
          up.gender_expression         AS gender_expression,
          (
            SELECT array_agg(am."mediaId")
            FROM "advertisement-media" AS am
            WHERE am."advertisementId" = a.id
          ) AS advertisement_media
        FROM "${adTable}" AS a

               JOIN "${profileTable}" AS up
                    ON up.user_id = a.user_id
          ${heightClause}
          ${genderExprClause}
          ${constitutionClause}
          ${genderClause}

          JOIN "${userTable}" AS u
        ON u.id = a.user_id
          ${ageClause}

        WHERE
          ST_DWithin(
          a.location,
          ST_SetSRID(ST_MakePoint(:lon, :lat), 4326),
          :distanceInMeters
          )
          AND a.id      > :lastId
          AND a.user_id <> :userId

        ORDER BY a.id ASC
          LIMIT :pageSize;
      `;

      adsBatch = await sequelize!.query(sql, {
        replacements: {
          lon,
          lat,
          distanceInMeters,
          lastId,
          userId,
          pageSize,
        },
        type: QueryTypes.SELECT,
        raw: true,
        nest: true,
      });

      for (const row of adsBatch) {
        if (this.matchesMutualFilters(explorerUserProfile, row.filter)) {
          suitableAds.push(row as Advertisement);
        }
      }

      if (adsBatch.length > 0) {
        lastId = adsBatch[adsBatch.length - 1].id;
      }
    } while (adsBatch.length === pageSize);

    this.logger.log('getSuitableAds: found advertisements', context);
    if (!suitableAds.length) {
      this.logger.error('getSuitableAds: not found ads', context);
      throw new NotFoundException('Advertisements are not found.');
    }

    this.logger.log(
      'getSuitableAds: found mutually matched advertisements',
      context,
    );
    return suitableAds;
  }

  private matchesMutualFilters(
    profile: UserProfile & { profile_owner: { age: number } },
    filter: {
      gender?: GendersEnum[];
      ageFrom?: number;
      ageTo?: number;
      heightFrom?: number;
      heightTo?: number;
      constitution?: ConstitutionsEnum[];
      genderExpressionFrom?: number;
      genderExpressionTo?: number;
    },
  ): boolean {
    if (Array.isArray(filter.gender) && filter.gender.length > 0) {
      if (!filter.gender.includes(profile.sex!)) {
        return false;
      }
    }

    if (!!filter.ageFrom && !!filter.ageTo) {
      const age = profile.profile_owner.age;
      if (age < filter.ageFrom || age > filter.ageTo) {
        return false;
      }
    }

    if (!!filter.heightFrom && !!filter.heightTo) {
      const h = profile.height!;
      if (h < filter.heightFrom || h > filter.heightTo) {
        return false;
      }
    }

    if (Array.isArray(filter.constitution) && filter.constitution.length > 0) {
      if (!filter.constitution.includes(profile.constitution!)) {
        return false;
      }
    }

    if (!!filter.genderExpressionFrom && !!filter.genderExpressionTo) {
      const genderExpression = profile.gender_expression!;
      if (
        genderExpression < filter.genderExpressionFrom ||
        genderExpression > filter.genderExpressionTo
      ) {
        return false;
      }
    }

    return true;
  }
}
