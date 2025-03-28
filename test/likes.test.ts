jest.mock('../src/utils/with-notify', () => ({
  WithNotify: (eventName: any) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]) {
        return originalMethod.apply(this, args);
      };
      return descriptor;
    };
  },
}));

import { INestApplication } from '@nestjs/common';
import { closeApp, getApp } from './helpers/get-app';
import { LikesController } from '../src/modules/likes-module/likes.controller';
import { Advertisement } from '../src/contracts/db/models/advertisements.entity';
import { mockUserAdvRequest } from './mocks/advertisement.mock';
import { AdsController } from '../src/modules/ads-module/ads.controller';
import { Like } from '../src/contracts/db/models/like.entity';
import { UserStats } from '../src/contracts/db/models/user-stats.entity';
import { Chat } from '../src/contracts/db/models/chat.entity';
import { ChatUser } from '../src/contracts/db/models/chat-user.entity';


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
      { userId: 3, fields: mockUserAdvRequest },
      null as any
    );
  });
  afterAll(async () => {
    await closeApp();
  });

  it('Like should be sent correctly', async () => {
    const result = await likesController.sendLike({
      userId: 4, advertisementId: advertisement.result!.id
    });
    const like = Like.findOne({
      where: {
        user_id: 4, advertisement_id: advertisement.result!.id
      }
    });
    expect(result.success).toBe(true);
    expect(like).toBeTruthy();
  });

  it('Like should be dismissed correctly', async () => {
    await likesController.sendLike({
      userId: 4, advertisementId: advertisement.result!.id
    });
    const dismissedLikeResult = await likesController.dismissLike({
      userId: 4, advertisementId: advertisement.result!.id
    });
    const like = Like.findOne({
      where: {
        user_id: 4, advertisement_id: advertisement.result!.id
      }
    });
    expect(dismissedLikeResult.success).toBe(true);
    expect(Object.keys(like).length).toBeFalsy();
  });

  it('Available likes should be reduced according to sent likes', async () => {
    await likesController.sendLike({
      userId: 4, advertisementId: advertisement.result!.id
    });
    const userStats = await UserStats.findOne({
      where: { user_id: 4 }
    });

    expect(userStats!.available_likes).toBe(9);
  });

  it('Available likes should be refunded by +1 when like dismissed', async () => {
    await Like.destroy({ where: { user_id: 4 }});
    await UserStats.update({ available_likes: 10 }, {
      where: { user_id: 4 }
    });
    await likesController.sendLike({
      userId: 4, advertisementId: advertisement.result!.id
    });
    const userStatsBeforeDismiss = await UserStats.findOne({
      where: { user_id: 4 }
    });
    await likesController.dismissLike({
      userId: 4, advertisementId: advertisement.result!.id
    });
    const userStatsAfterDismiss = await UserStats.findOne({
      where: { user_id: 4 }
    });
    expect(userStatsBeforeDismiss!.available_likes).toBe(9);
    expect(userStatsAfterDismiss!.available_likes).toBe(10);
  });

  it('Like should not be sent if user have no available likes', async () => {
    for (let i = 0; i < 10; i++) {
      const adv = await advertisementController.createAdv(
        { userId: 3, fields: mockUserAdvRequest },
        null as any
      );
      await likesController.sendLike({
        userId: 4, advertisementId: adv.result!.id
      });
    }
    const adv = await advertisementController.createAdv(
      { userId: 3, fields: mockUserAdvRequest },
      null as any
    );
    const sendLikeResult = await likesController.sendLike({
      userId: 4, advertisementId: adv.result!.id
    });
    expect(sendLikeResult.success).toBe(false);
  });

  it('Like should not be sent if user likes its own adv', async () => {
    const adv = await advertisementController.createAdv(
      { userId: 3, fields: mockUserAdvRequest },
      null as any
    );
    const sendLikeResult = await likesController.sendLike({
      userId: 3, advertisementId: adv.result!.id
    });
    expect(sendLikeResult.success).toBe(false);
    expect(sendLikeResult.error!.status).toBe(400);
  });

  it('Advertisement owner should be able to match with user who liked', async () => {
    const userStatsOfOwnerBefore = await UserStats.findOne({
      where: { user_id: 3 }
    });
    const userStatsOfLikerBefore = await UserStats.findOne({
      where: { user_id: 2 }
    });
    const adv = await advertisementController.createAdv(
      { userId: 3, fields: mockUserAdvRequest },
      null as any
    );
    await likesController.sendLike({
      userId: 2, advertisementId: adv.result!.id
    });
    const like = await Like.findOne({
      where: { advertisement_id: adv.result!.id }
    });
    await likesController.makeMatch({
      userId: 3, likeId: like!.id
    });
    const incorrectMatchResponse = await likesController.makeMatch({
      userId: 3, likeId: like!.id
    });
    const chat = await Chat.findOne({
      where: { advertisement_id: adv.result!.id }
    });
    const chatUsers = await ChatUser.findAll({
      where: { chat_id: chat!.id }
    });
    const userStatsOfOwner = await UserStats.findOne({
      where: { user_id: 3 }
    });
    const userStatsOfLiker = await UserStats.findOne({
      where: { user_id: 2 }
    });

    expect(userStatsOfOwner!.active_chats).toBeGreaterThan(userStatsOfOwnerBefore!.active_chats);
    expect(userStatsOfLiker!.active_chats).toBeGreaterThan(userStatsOfLikerBefore!.active_chats);
    expect(chatUsers).toHaveLength(2);
    expect(chat).toBeTruthy();
    expect(incorrectMatchResponse.success).toBe(false);
  });
});
