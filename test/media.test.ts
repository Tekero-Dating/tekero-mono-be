import { closeApp, getApp } from './helpers/get-app';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Media } from '../src/contracts/db/models/mdeia.entity';
import { MediaAccess } from '../src/contracts/db/models/mdeia-access.entity';

describe('Media module testing suite', () => {
  let App: INestApplication;
  beforeAll(async () => {
    App = await getApp();
  });
  afterAll(async () => {
    await closeApp();
  });

  describe('Upload, get and delete successful', () => {
    const file = Buffer.from('test-file-buffer');
    let mediaId;

    it('Upload successful', async () => {
      const { body: uploadMediaBody } = await request(App.getHttpServer())
        .post('/api/media/upload-media/1')
        .attach('file', file, { filename: 'test-file.txt' })
        .query({ expiration: 100 })
        .expect(201);
      mediaId = uploadMediaBody.result.mediaId;
    });

    it('Get media successfully', async () => {
      const { body: getMediaBody } = await request(App.getHttpServer())
        .get(`/api/media/get-media/1/${mediaId}`)
        .expect(200);

      expect(mediaId).toBeTruthy();
      expect(getMediaBody.url).toBeTruthy()
    });

    it('Set media privacy successfully', async () => {
      await request(App.getHttpServer())
        .patch(`/api/media/update-privacy/1/${mediaId}`)
        .expect(202);
      const mediaPrivate = await Media.findByPk(mediaId);

      await request(App.getHttpServer())
        .patch(`/api/media/update-privacy/1/${mediaId}`)
        .expect(202);
      const mediaNotPrivate = await Media.findByPk(mediaId);

      expect(mediaPrivate!.private).toBe(true);
      expect(mediaNotPrivate!.private).toBe(false);
    });

    it('Grant private media access', async () => {
      await request(App.getHttpServer())
        .patch(`/api/media/update-media-access/1/2/true`)
        .expect(202);
      const mediaAccess = await MediaAccess.findOne({
        where: {
          owner_id: 1,
          accessor_id: 2
        }
      });

      await request(App.getHttpServer())
        .patch(`/api/media/update-media-access/1/2/false`)
        .expect(202);
      const mediaAccessNotGranted = await MediaAccess.findOne({
        where: {
          owner_id: 1,
          accessor_id: 2
        }
      });

      expect(mediaAccess).toBeTruthy();
      expect(mediaAccessNotGranted).toBeFalsy();
    });

    it('Delete media successfully', async () => {
      await request(App.getHttpServer())
        .delete(`/api/media/delete-media/1/${mediaId}`)
        .expect(204);

      await request(App.getHttpServer())
        .get(`/api/media/get-media/1/${mediaId}`)
        .expect(404);
    });
  });
});
