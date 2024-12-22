import { INestApplication } from '@nestjs/common';
import { closeApp, getApp } from './helpers/get-app';
import { LikesController } from '../src/modules/likes-module/likes.controller';
import { Advertisement } from '../src/contracts/db/models/advertisements.entity';
import { mockUserAdvRequest } from './mocks/advertisement.mock';
import { AdsController } from '../src/modules/ads-module/ads.controller';
import { Like } from '../src/contracts/db/models/like.entity';
import { UserStats } from '../src/contracts/db/models/user-stats.entity';

describe('Likes testing suite', () => {
  let App: INestApplication;
  let likesController: LikesController;
  let advertisementController: AdsController;
  let advertisement: { success: boolean, result?: Advertisement };

  beforeAll(async () => {
    App = await getApp();
    likesController = App.get(LikesController);
    advertisementController = App.get(AdsController);
    advertisement = await advertisementController.createAdv(
      { userId: 1, fields: mockUserAdvRequest },
      null as any
    );
  });
  afterAll(async () => {
    await closeApp();
  });

  it('Like should be sent correctly', async () => {
    const result = await likesController.sendLike({
      userId: 2, advertisementId: advertisement.result!.id
    });
    const like = Like.findOne({
      where: {
        user_id: 2, advertisement_id: advertisement.result!.id
      }
    });
    expect(result.success).toBe(true);
    expect(like).toBeTruthy();
  });

  it('Like should be dismissed correctly', async () => {
    await likesController.sendLike({
      userId: 2, advertisementId: advertisement.result!.id
    });
    const dismissedLikeResult = await likesController.dismissLike({
      userId: 2, advertisementId: advertisement.result!.id
    });
    const like = Like.findOne({
      where: {
        user_id: 2, advertisement_id: advertisement.result!.id
      }
    });
    expect(dismissedLikeResult.success).toBe(true);
    expect(Object.keys(like).length).toBeFalsy();
  });

  it('Available likes should be reduced according to sent likes', async () => {
    await likesController.sendLike({
      userId: 2, advertisementId: advertisement.result!.id
    });
    const userStats = await UserStats.findOne({
      where: { user_id: 2 }
    });

    expect(userStats!.available_likes).toBe(9);
  });

  it('Available likes should be refunded by +1 when like dismissed', async () => {
    await likesController.sendLike({
      userId: 2, advertisementId: advertisement.result!.id
    });
    const userStatsBeforeDismiss = await UserStats.findOne({
      where: { user_id: 2 }
    });
    await likesController.dismissLike({
      userId: 2, advertisementId: advertisement.result!.id
    });
    const userStatsAfterDismiss = await UserStats.findOne({
      where: { user_id: 2 }
    });
    expect(userStatsBeforeDismiss!.available_likes).toBe(9);
    expect(userStatsAfterDismiss!.available_likes).toBe(10);
  });

  it('Like should not be sent if user have no available likes', async () => {
    for (let i = 0; i < 10; i++) {
      const adv = await advertisementController.createAdv(
        { userId: 1, fields: mockUserAdvRequest },
        null as any
      );
      await likesController.sendLike({
        userId: 2, advertisementId: adv.result!.id
      });
    }
    const adv = await advertisementController.createAdv(
      { userId: 1, fields: mockUserAdvRequest },
      null as any
    );
    const sendLikeResult = await likesController.sendLike({
      userId: 2, advertisementId: adv.result!.id
    });
    expect(sendLikeResult.success).toBe(false);
  });
});
