import { wait } from '../src/utils/wait';

jest.mock('../src/utils/with-notify', () => ({
  WithNotify: (eventName: string) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]) {
        return originalMethod.apply(this, args);
      };
      return descriptor;
    };
  },
}));

import { closeApp, getApp } from './helpers/get-app';
import { INestApplication } from '@nestjs/common';
import { ChatGateway } from '../src/modules/chat-module/chat.gateway';
import { Server } from 'socket.io';
import * as io from 'socket.io-client';
import { JwtAuthGuard } from '../src/utils/jwt.auth-guard';
import { mockUserAdvRequest } from './mocks/advertisement.mock';
import { AdsController } from '../src/modules/ads-module/ads.controller';
import { LikesController } from '../src/modules/likes-module/likes.controller';
import { Chat } from '../src/contracts/db/models/chat.entity';
import { MediaController } from '../src/modules/media-module/media.controller';


const user1jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjF9.f17oxTnq-RV-wZv-AHg1kZgMxLzqChaHSmEdz3JX_ps';
const user2jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjJ9.FmbEuwhrfCuBzONPcoFcTLL6hPC6rfaXkiUQvwUkfCQ';
const user3jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjN9.b3SONjfv4Kllh2A1meVruGoggs8NApoiQ1LwBnpp6es';

jest.spyOn(JwtAuthGuard.prototype, 'canActivate')
  .mockImplementation(() => true);

describe('Chat', () => {
  let App: INestApplication;
  let gateway: ChatGateway;
  let server: Server;
  let user1: io.Socket;
  let user2: io.Socket;
  let user3: io.Socket;
  let advertisement;
  let chat: Chat | undefined;


  beforeAll(async () => {
    App = await getApp();
    gateway = App.get(ChatGateway);
    server = gateway['server'];

    const advertisementController = App.get(AdsController);
    advertisement = await advertisementController.createAdv(
      { userId: 1, fields: mockUserAdvRequest },
      null as any
    );
    const likesController = App.get(LikesController);
    const like = await likesController.sendLike({ userId: 2, advertisementId: advertisement?.result?.id });
    const match = await likesController.makeMatch({ userId: 1, likeId: like?.result?.like.id });
    chat = match?.result?.chat;
  });
  afterEach(async  () => {
    if (user1) user1.disconnect();
    if (user2) user2.disconnect();
    if (user3) user3.disconnect();
  });
  afterAll(async () => {
    if (user1) user1.disconnect();
    if (user2) user2.disconnect();
    if (user3) user3.disconnect();
    await closeApp();
  });

  describe('Chat connection and disconnection', () => {
    it('Users should be able to be connected to the same chat', async () => {
      user1 = io.connect('http://localhost:3031/chat', {
        query: { token: user1jwt, chatId: chat!.id },
      });
      await wait(100);
      user1.emit('join', chat!.id);
      user2 = io.connect('http://localhost:3031/chat', {
        query: { token: user2jwt, chatId: chat!.id },
      });
      await wait(100);
      user2.emit('join', chat!.id);
      await wait(100);
      // @ts-ignore
      const rooms = server.adapter.rooms.get(String(chat!.id));
      expect(rooms?.size).toBe(2);
    });

    it('Only allowed users can connect chatroom', async () => {
      user1 = io.connect('http://localhost:3031/chat', {
        query: { token: user1jwt, chatId: chat!.id },
      });
      await wait(100);
      user1.emit('join');
      user2 = io.connect('http://localhost:3031/chat', {
        query: { token: user2jwt, chatId: chat!.id },
      });
      await wait(100);
      user2.emit('join');
      user3 = io.connect('http://localhost:3031/chat', {
        query: { token: user3jwt, chatId: chat!.id },
      });
      await wait(100);
      user3.emit('join');
      await wait(100);
        // @ts-ignore
      const rooms = server.adapter.rooms.get(String(chat!.id));
      expect(rooms?.size).toBe(2);
    });

    it('Chat easily disconnecting when user leaves', async () => {
      let roomsBeforeSize, roomsAfterSize;
      user1 = io.io('http://localhost:3031/chat', {
        query: { token: user1jwt, chatId: chat!.id },
      });
      await wait(100);
      user1.emit('join');
      user2 = io.io('http://localhost:3031/chat', {
        query: { token: user2jwt, chatId: chat!.id },
      });
      await wait(100);
      user2.emit('join');
      await wait(100);
      // @ts-ignore
      roomsBeforeSize = server.adapter.rooms.get(String(chat!.id)).size;
      user1.disconnect();
      await wait(100);
      // @ts-ignore
      roomsAfterSize = server.adapter.rooms.get(String(chat!.id)).size;
      expect(roomsBeforeSize).toBe(2);
      expect(roomsAfterSize).toBe(1);
    });
  });

  describe('Chat message and media exchange', () => {
    it('User 1 sends message to User2', async () => {
      let message = undefined;
      user1 = io.io('http://localhost:3031/chat', {
        query: { token: user1jwt, chatId: chat!.id },
      });
      await wait(100);
      user1.emit('join');
      user2 = io.io('http://localhost:3031/chat', {
        query: { token: user2jwt, chatId: chat!.id },
      });
      await wait(100);
      user2.emit('join');
      await wait(100);
      user2.on('receiveMessage', (data) => {
        message = data;
      });
      user1.emit('send', { message: 123 });
      await wait(100);
      expect(message).not.toBeUndefined();
    });

    it('User 1 sends image to user2', async () => {
      let imageMessage;
      user1 = io.connect('http://localhost:3031/chat', {
        query: { token: user1jwt, chatId: chat!.id },
      });
      await wait(100);
      user1.emit('join');
      user2 = io.connect('http://localhost:3031/chat', {
        query: { token: user2jwt, chatId: chat!.id },
      });
      await wait(100);
      user2.emit('join');
      await wait(100);
      user2.on('receiveMessage', (data) => {
        imageMessage = data;
      });
      const dummyImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA' +
        'AAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
      user1.emit('upload-image', {
        image: dummyImageData,
        fileName: 'dummy.png',
        mimeType: 'image/png'
      });
      await wait(500);
      const mediaController = App.get(MediaController);
      await mediaController.deleteMedia({ userId: imageMessage.result.user_id, mediaId: imageMessage.result.media_id }, null as any);
      expect(imageMessage).toBeTruthy();
    });
  });
});
