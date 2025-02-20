import { RmqContext } from '@nestjs/microservices';
import { Message } from '../db/models/message.entity';

export namespace ISendMessage {
  export interface Request {
    userId: number;
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
    userId: number;
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
    userId: number;
    chatId: number;
  }
  export interface Response {
    success: boolean;
    result?: (Message & { user: { firstName: string } })[];
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
