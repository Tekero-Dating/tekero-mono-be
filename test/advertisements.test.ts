import { INestApplication } from '@nestjs/common';
import { closeApp, getApp } from './helpers/get-app';
import request from 'supertest';
import { Advertisement } from '../src/contracts/db/models/advertisements.entity';
import { AdvertisementMedia } from '../src/contracts/db/models/junctions/advertisement-media.entity';
import { AdStatusesEnum } from '../src/contracts/db/models/enums/ad-statuses.enum';

const mockUserAdvRequest = {
  "text": "I just test the app",
  "type": "DATE",
  "opener": "TEXT",
  "photos": [2, 3],
  "targetFilters": {
    "gender": ["TRANS_FEMALE"],
    "genderExpressionFrom": 50,
    "genderExpressionTo": 70,
    "orientationFrom": 50,
    "orientationTo": 70,
    "ageFrom": 22,
    "ageTo": 25,
    "heightFrom": 150,
    "heightTo": 170,
    "distance": 100,
    "constitution": ["CURVY", "AVERAGE", "SKINNY"]
  },
  "location": {
    "type": "Point", "coordinates": [429686.70192539, 4582259.1043529]
  }
}

describe('Advertisements module tests', () => {
  let App: INestApplication;
  beforeAll(async () => {
    App = await getApp();
  });
  afterAll(async () => {
    await closeApp();
  });

  describe('Adv creation', () => {
    let newAdvId: number;

    it('Confirm that usual adv can be created successfully', async () => {
      const { body: createAdvBody } = await request(App.getHttpServer())
        .post('/api/ads/create/2')
        .send(mockUserAdvRequest)
        .expect(201);
        const createdAdv = await Advertisement.findByPk(createAdvBody.id);
        expect(createdAdv).toBeTruthy();
    });

    it('Confirm that created adv can contain only photos that are belonged to user who creates the adv', async () => {
      const { body: createAdvBody } = await request(App.getHttpServer())
        .post('/api/ads/create/1')
        .send({
          ...mockUserAdvRequest,
          photos: [3, 4, 5]
        })
        .expect(201);
      newAdvId = createAdvBody.id;
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
      const { body: createAdvBody } = await request(App.getHttpServer())
        .post('/api/ads/create/2')
        .send({
          ...mockUserAdvRequest,
          photos: [2, 3]
        })
        .expect(201);
      const newAdvId = createAdvBody.id;
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
      const { body: createAdvBody } = await request(App.getHttpServer())
        .post('/api/ads/create/2')
        .send(mockUserAdvRequest)
        .expect(201);
      const createdAdv = await Advertisement.findByPk(createAdvBody.id);
      await request(App.getHttpServer())
        .put(`/api/ads/edit/2/${createAdvBody.id}`)
        .send({
          targetFilters: {
            gender: ["TRANS_FEMALE", "FEMALE"]
          }
        })
        .expect(200);
      const editedAdv = await Advertisement.findByPk(createAdvBody.id);

      await request(App.getHttpServer())
        .put(`/api/ads/edit/2/${createAdvBody.id}`)
        .send({
          targetFilters: {
            ageFrom: 26
          }
        })
        .expect(400); // confirm that ranged filters can't be broken

      expect(createdAdv!.filter.gender[0]).toBe('TRANS_FEMALE');
      expect(editedAdv!.filter.gender[0]).toBe('TRANS_FEMALE');
      expect(editedAdv!.filter.gender[1]).toBe('FEMALE');
    });
  });


  describe('User can activate and de activate his advertisement', () => {
    it ('activate', async () => {
      const { body: createAdvBody } = await request(App.getHttpServer())
        .post('/api/ads/create/2')
        .send(mockUserAdvRequest)
        .expect(201);

      await request(App.getHttpServer())
        .post(`/api/ads/publish/2/${createAdvBody.id}`)
        .expect(200);
      const publishedAdv = await Advertisement.findByPk(createAdvBody.id);

      expect(publishedAdv!.active).toBe(true);
      expect(publishedAdv!.status).toBe(AdStatusesEnum.ACTIVE);
      expect(publishedAdv!.activated).toBeTruthy();
    });

    it('deactivate', async () => {
      const { body: createAdvBody } = await request(App.getHttpServer())
        .post('/api/ads/create/2')
        .send(mockUserAdvRequest)
        .expect(201);

      await request(App.getHttpServer())
        .delete(`/api/ads/archive/2/${createAdvBody.id}`)
        .expect(200);
      const publishedAdv = await Advertisement.findByPk(createAdvBody.id);

      expect(publishedAdv!.active).toBe(false);
      expect(publishedAdv!.status).toBe(AdStatusesEnum.ARCHIVED);
    });
  });
});
