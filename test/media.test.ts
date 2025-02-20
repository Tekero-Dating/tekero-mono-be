import { closeApp, getApp } from './helpers/get-app';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Media } from '../src/contracts/db/models/mdeia.entity';
import { MediaAccess } from '../src/contracts/db/models/mdeia-access.entity';
import { JwtAuthGuard } from '../src/utils/jwt.auth-guard';
import { MediaController } from '../src/modules/media-module/media.controller';
import { MediaService } from '../src/modules/media-module/media.service';

jest
  .spyOn(JwtAuthGuard.prototype, 'canActivate')
  .mockImplementation(() => true);

const file = {
  fieldname: 'file',
  originalname: 'test-file.txt',
  encoding: '7bit',
  mimetype: 'text/plain',
  size: Buffer.byteLength('test-file-buffer'),
  buffer: Buffer.from('test-file-buffer'), // Include the file data as a Buffer
};

describe('Media module testing suite', () => {
  let App: INestApplication;
  let mediaController: MediaController;
  let mediaService: MediaService;

  beforeAll(async () => {
    App = await getApp();
    mediaController = App.get(MediaController);
    mediaService = App.get(MediaService);
  });
  afterAll(async () => {
    await closeApp();
  });

  describe('Upload, get and delete successful', () => {
    let mediaId;
    it('Upload successful', async () => {
      mediaId = await mediaService.uploadMedia({
        userId: 1,
        expiration: 100,
        file,
      });
      const mediaFromDB = await Media.findByPk(mediaId);
      expect(mediaFromDB).toBeTruthy();
    });

    it('Get media successfully', async () => {
      const media = await mediaController.getMedia(
        {
          mediaId,
          userId: 1,
        },
        null as any,
      );

      expect(mediaId).toBeTruthy();
      expect(media!.result!.url).toBeTruthy();
    });

    it('Set media privacy successfully', async () => {
      await mediaController.setMediaPrivacy(
        {
          mediaId,
          userId: 1,
        },
        null as any,
      );
      const mediaPrivate = await Media.findByPk(mediaId);

      await mediaController.setMediaPrivacy(
        {
          mediaId,
          userId: 1,
        },
        null as any,
      );
      const mediaNotPrivate = await Media.findByPk(mediaId);

      expect(mediaPrivate!.private).toBe(true);
      expect(mediaNotPrivate!.private).toBe(false);
    });

    it('Grant private media access', async () => {
      await mediaController.editMediaAccess(
        {
          ownerId: 1,
          accessorId: 2,
          giver: true,
        },
        null as any,
      );
      const mediaAccess = await MediaAccess.findOne({
        where: {
          owner_id: 1,
          accessor_id: 2,
        },
      });

      await mediaController.editMediaAccess(
        {
          ownerId: 1,
          accessorId: 2,
          giver: false,
        },
        null as any,
      );
      const mediaAccessNotGranted = await MediaAccess.findOne({
        where: {
          owner_id: 1,
          accessor_id: 2,
        },
      });

      expect(mediaAccess).toBeTruthy();
      expect(mediaAccessNotGranted).toBeFalsy();
    });

    it('Delete media successfully', async () => {
      await mediaController.deleteMedia(
        {
          userId: 1,
          mediaId,
        },
        null as any,
      );
      const media = await Media.findByPk(mediaId);
      expect(media).toBeFalsy();
    });
  });
});
