import { INestApplication } from '@nestjs/common';
import { closeApp, getApp } from './helpers/get-app';
import { Advertisement } from '../src/contracts/db/models/advertisements.entity';
import { AdvertisementMedia } from '../src/contracts/db/models/junctions/advertisement-media.entity';
import { AdStatusesEnum } from '../src/contracts/db/models/enums/ad-statuses.enum';
import { JwtAuthGuard } from '../src/modules/auth-module/jwt.auth-guard';
import { AdsController } from '../src/modules/ads-module/ads.controller';
import { AdTypesEnum } from '../src/contracts/db/models/enums/ad-types.enum';
import { ConstitutionsEnum, GendersEnum, OpenersEnum } from '../src/contracts/db/models/enums';
import { mockUserAdvRequest } from './mocks/advertisement.mock';

jest.spyOn(JwtAuthGuard.prototype, 'canActivate')
  .mockImplementation(() => true);

describe('Advertisements module tests', () => {
  let App: INestApplication;
  let adsController: AdsController;
  beforeAll(async () => {
    App = await getApp();
    adsController = App.get(AdsController);
  });
  afterAll(async () => {
    await closeApp();
  });

  describe('Adv creation', () => {
    let newAdvId: number;

    it('Confirm that usual adv can be created successfully', async () => {
      const advertisement = await adsController.createAdv(
        { fields: mockUserAdvRequest, userId: 2 },
        null as any
      );
        const createdAdv = await Advertisement.findByPk(advertisement.result!.id);
        expect(createdAdv).toBeTruthy();
    });

    it('Confirm that created adv can contain only photos that are belonged to user who creates the adv', async () => {
      const advertisement = await adsController.createAdv(
        {
          fields: {
            ...mockUserAdvRequest,
              photos: [3, 4, 5]
          },
          userId: 1
        },
        null as any
      );
      newAdvId = advertisement.result!.id;
      const advMedias = await AdvertisementMedia.findAll({
        where: {
          advertisementId: newAdvId
        }
      });

      // TODO: fix advmedia
      const foreignAdvMedia = advMedias.find(({ mediaId }) => mediaId === 3);
      expect(advMedias.length).toBe(2);
      expect(foreignAdvMedia).toBe(undefined);
    });

    it('Confirm that user can not attach private photos to the advertisement', async () => {
      const advertisement = await adsController.createAdv(
        {
          fields: {
            ...mockUserAdvRequest,
            photos: [2, 3]
          },
          userId: 2
        },
        null as any
      );
      const newAdvId = advertisement.result!.id;
      const advMedias = await AdvertisementMedia.findAll({
        where: {
          advertisementId: newAdvId
        }
      });

      const privateMedia = advMedias.find(({ mediaId }) => mediaId === 2);
      expect(advMedias.length).toBe(1);
      expect(privateMedia).toBeUndefined();
    });

    it('User can edit any field of his advertisement', async () => {
      const advertisement = await adsController.createAdv(
        { fields: mockUserAdvRequest, userId: 2 },
        null as any
      );

      const createdAdv = await Advertisement.findByPk(advertisement.result!.id);

      await adsController.editAdv(
        {
          fields: {
            targetFilters: {
              gender: [GendersEnum.TRANS_FEMALE, GendersEnum.FEMALE]
            }
          },
          userId: 2,
          advId: createdAdv!.id
        },
        null as any
      );

      const editedAdv = await Advertisement.findByPk(createdAdv!.id);

      expect(await adsController.editAdv(
        {
          fields: {
            targetFilters: {
              ageFrom: 26
            }
          },
          userId: 2,
          advId: createdAdv!.id
        },
        null as any
      )).toHaveProperty('error');
      expect(createdAdv!.filter.gender[0]).toBe('TRANS_FEMALE');
      expect(editedAdv!.filter.gender[0]).toBe('TRANS_FEMALE');
      expect(editedAdv!.filter.gender[1]).toBe('FEMALE');
    });
  });


  describe('User can activate and de activate his advertisement', () => {
    it ('activate', async () => {
      const advertisement = await adsController.createAdv(
        { fields: mockUserAdvRequest, userId: 2 },
        null as any
      );
      await adsController.publishAdv(
        { advId: advertisement.result!.id, userId: 2 },
        null as any
      );
      const publishedAdv = await Advertisement.findByPk(advertisement.result!.id);

      expect(publishedAdv!.active).toBe(true);
      expect(publishedAdv!.status).toBe(AdStatusesEnum.ACTIVE);
      expect(publishedAdv!.activated).toBeTruthy();
    });

    it('deactivate', async () => {
      const advertisement = await adsController.createAdv(
        { fields: mockUserAdvRequest, userId: 2 },
        null as any
      );

      await adsController.archiveAdv(
        { advId: advertisement.result!.id, userId: 2 },
        null as any
      );

      const publishedAdv = await Advertisement.findByPk(advertisement.result!.id);

      expect(publishedAdv!.active).toBe(false);
      expect(publishedAdv!.status).toBe(AdStatusesEnum.ARCHIVED);
    });
  });
});
