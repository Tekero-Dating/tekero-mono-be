import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Message } from '../../contracts/db/models/message.entity';
import { MODELS_REPOSITORIES_ENUM } from '../../contracts/db/models/models.enum';
import { ChatUser } from '../../contracts/db/models/chat-user.entity';
import { Chat } from '../../contracts/db/models/chat.entity';
import {
  ChatTypesEnum,
  MessageTypesEnum,
} from '../../contracts/db/models/enums';
import { User } from '../../contracts/db/models/user.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  constructor(
    @Inject(MODELS_REPOSITORIES_ENUM.MESSAGE)
    private messageRepository: typeof Message,
    @Inject(MODELS_REPOSITORIES_ENUM.CHAT_USER)
    private chatUserRepository: typeof ChatUser,
    @Inject(MODELS_REPOSITORIES_ENUM.CHAT)
    private chatRepository: typeof Chat,
  ) {}

  private async checkIfChatTypeValid(chatId: number): Promise<boolean> {
    this.logger.log(`private function checkIfChatTypeValid, ${chatId}`);
    const chat = await this.chatRepository.findByPk(chatId);
    if (chat?.chat_type === ChatTypesEnum.ENDED) {
      this.logger.warn('Chat invalid');
      return false;
    }
    this.logger.log('Chat valid');
    return true;
  }

  private async checkIfUserAllowedInChat(
    userId: number,
    chatId: number,
  ): Promise<boolean> {
    this.logger.log(`Private func checkIfUserAllowedInChat`, {
      userId,
      chatId,
    });
    const isUserInChat = await this.chatUserRepository.findOne({
      where: {
        chat_id: chatId,
        user_id: userId,
      },
    });
    this.logger.log('Valid?:', { isUserInChat });
    if (!isUserInChat) {
      return false;
    }
    return true;
  }

  async sendMessage(
    userId: number,
    chatId: number,
    content: string,
  ): Promise<Message> {
    this.logger.log(`User ${userId} sent message to ${chatId}`);
    const validChat = await this.checkIfChatTypeValid(chatId);
    if (!validChat) {
      this.logger.warn(`Chat invalid`, { chatId });
      throw new BadRequestException('Chat already ended.');
    }

    const isUserInChat = await this.checkIfUserAllowedInChat(userId, chatId);
    if (!isUserInChat) {
      this.logger.warn('User not allowed in the chat', { userId, chatId });
      throw new NotFoundException('User is not allowed in this chat.');
    }

    try {
      this.logger.log('sendMessage: creating a message', { userId, chatId });
      const message = await this.messageRepository.create(
        {
          type: MessageTypesEnum.TEXT,
          user_id: userId,
          chat_id: chatId,
          content: content,
        },
        { returning: true },
      );
      this.logger.log('sendMessage: Message created and sent', {
        userId,
        chatId,
      });
      return message;
    } catch (error) {
      this.logger.error(
        'sendMessage: something critical happen while creating message',
        { error, userId, chatId },
      );
      throw new InternalServerErrorException(
        'Can not send message at this time ',
      );
    }
  }

  async getChatHistory(
    userId: number,
    chatId: number,
  ): Promise<(Message & { user: { firstName: string } })[]> {
    this.logger.log('getChatHistory: ', { userId, chatId });
    const validChat = await this.checkIfChatTypeValid(chatId);
    this.logger.log('getChatHistory: valid chat?', {
      userId,
      chatId,
      validChat,
    });
    if (!validChat) {
      this.logger.warn(`Chat invalid`, { userId, chatId });
      throw new BadRequestException('Chat already ended.');
    }

    const isUserInChat = await this.checkIfUserAllowedInChat(userId, chatId);
    this.logger.log('getChatHistory: allowed in chat? ', {
      userId,
      chatId,
      isUserInChat,
    });
    if (!isUserInChat) {
      this.logger.warn('getChatHistory: not allowed', { userId, chatId });
      throw new NotFoundException('User is not allowed in this chat.');
    }

    this.logger.log('getChatHistory: getting all messages for the given chat', {
      userId,
      chatId,
    });
    try {
      const messages = await this.messageRepository.findAll({
        where: {
          chat_id: chatId,
        },
        include: [
          {
            model: User,
            attributes: ['firstName'],
          },
        ],
        order: [['createdAt', 'ASC']],
      });
      return messages;
    } catch (error) {
      this.logger.error(
        'getChatHistory: Something critical happen on the server: ',
        { error, userId, chatId },
      );
      throw new InternalServerErrorException('Can not fetch messages history');
    }
  }

  async uploadImage({ userId, chatId, imageId }) {
    const context = { userId, chatId, imageId };
    this.logger.log('uploadImage', { context });
    const validChat = await this.checkIfChatTypeValid(chatId);
    if (!validChat) {
      throw new BadRequestException('Chat already ended.');
    }

    const isUserInChat = await this.checkIfUserAllowedInChat(userId, chatId);
    if (!isUserInChat) {
      this.logger.warn('uploadImage: not allowed', { userId, chatId });
      throw new NotFoundException('User is not allowed in this chat.');
    }

    try {
      this.logger.log('uploadImage: try to create message', { context });
      const message = await this.messageRepository.create(
        {
          type: MessageTypesEnum.MEDIA,
          user_id: userId,
          chat_id: chatId,
          content: null,
          media_id: imageId,
        },
        { returning: true },
      );

      this.logger.log('uploadImage: success.', { context });
      return {
        success: true,
        result: message,
      };
    } catch (error) {
      this.logger.error('uploadImage: something happen on the server side', {
        error,
        context,
      });
      throw new InternalServerErrorException('Can not upload image');
    }
  }
}
