import { Controller, Inject, Post } from '@nestjs/common';
import { IChatController } from '../../contracts/chats-interface/chats.api-interface';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import {
  CHAT_MESSAGE_PATTERNS,
  CHAT_SERVICE_NAME,
} from '../../contracts/chats-interface/chats.constants';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController implements IChatController {
  constructor(
    @Inject(CHAT_SERVICE_NAME) private client: ClientProxy,
    private readonly chatService: ChatService,
  ) {}

  @MessagePattern(CHAT_MESSAGE_PATTERNS.GET_CHAT_HISTORY)
  async getChatHistory(@Payload() payload, @Ctx() context: RmqContext) {
    try {
      const result = await this.chatService.getChatHistory(
        payload.userId,
        payload.chatId,
      );
      return {
        success: true,
        result,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  @MessagePattern(CHAT_MESSAGE_PATTERNS.SEND_MESSAGE)
  async sendMessage(@Payload() payload, @Ctx() context: RmqContext) {
    try {
      const result = await this.chatService.sendMessage(
        payload.userId,
        payload.chatId,
        payload.message,
      );
      return {
        success: true,
        result,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  @MessagePattern(CHAT_MESSAGE_PATTERNS.UPLOAD_IMAGE)
  async sendMedia(@Payload() payload, @Ctx() context: RmqContext) {
    try {
      const result = await this.chatService.uploadImage({
        userId: payload.userId,
        chatId: payload.chatId,
        imageId: payload.imageId,
      });
      return {
        success: true,
        result: result.result,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }
}
