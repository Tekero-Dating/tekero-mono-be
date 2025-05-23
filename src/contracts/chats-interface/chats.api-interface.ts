import { RmqContext } from '@nestjs/microservices';
import { Message } from '../db/models/message.entity';
import { Model } from 'sequelize';

export namespace ISendMessage {
  export interface Request {
    userId: string;
    chatId: number;
    message: string;
  }
  export interface Response {
    success: boolean;
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export namespace ISendMedia {
  export interface Request {
    userId: string;
    chatId: number;
    mediaId: number;
  }
  export interface Response {
    success: boolean;
    result?: Message;
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export namespace IGetChatHistory {
  export interface Request {
    userId: string;
    chatId: number;
  }
  export interface Response {
    success: boolean;
    result?: (Omit<
      Message,
      | keyof Model<any, any>
      | '$get'
      | '$add'
      | '$set'
      | '$count'
      | '$create'
      | '$has'
      | '$remove'
      | 'user'
    > & { user: { firstName: string } })[];
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export interface IChatController {
  /**
   * Checks if user allowed in the chat, if chat exists and sends a message.
   */
  sendMessage(
    payload: ISendMessage.Request,
    context: RmqContext,
  ): Promise<ISendMessage.Response>;

  /**
   * Uploads media, sends to a client a mediaId so client know which image to display.
   */
  sendMedia(
    payload: ISendMedia.Request,
    context: RmqContext,
  ): Promise<ISendMedia.Response>;

  /**
   * Checks if user allowed in chat, chat existence, then sends all messages
   * from the chat history.
   */
  getChatHistory(
    payload: IGetChatHistory.Request,
    context: RmqContext,
  ): Promise<IGetChatHistory.Response>;
}
