import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BadRequestException, Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { MODELS_REPOSITORIES_ENUM } from '../../contracts/db/models/models.enum';
import { Chat } from '../../contracts/db/models/chat.entity';
import { ChatUser } from '../../contracts/db/models/chat-user.entity';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from '../../config/config';
import { CHAT_MESSAGE_PATTERNS, CHAT_SERVICE_NAME } from '../../contracts/chats-interface/chats.constants';
import { ClientProxy } from '@nestjs/microservices';
import { ISendMessage } from '../../contracts/chats-interface/chats.api-interface';
import { rmqSend } from '../../utils/rmq-utils.nest';
import { TekeroError } from '../../utils/error-handling-utils';
import { MediaService } from '../media-module/media.service';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*'
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer()
  server: Server;

  constructor (
    private jwtService: JwtService,
    @Inject(MODELS_REPOSITORIES_ENUM.CHAT)
    private chatRepository: typeof Chat,
    @Inject(MODELS_REPOSITORIES_ENUM.CHAT_USER)
    private chatUserRepository: typeof ChatUser,
    @Inject(CHAT_SERVICE_NAME)
    private readonly client: ClientProxy,
    private readonly mediaService: MediaService
  ) {}

  /**
   * Handle client connection
   */
  async handleConnection(
      @ConnectedSocket() client: Socket,
    ) {
    const context = { chatId: client.handshake.query?.chatId, user: {} };
    this.logger.log('Chat connection', { ...context });
    try {
      const { token, chatId } = client.handshake.query;

      if (!token) {
        this.logger.error('Chat connection: empty token', { ...context })
        throw new UnauthorizedException('Auth token is not provided');
      }
      const payload = this.jwtService.verify(token as string, {
        secret: JWT_SECRET // TODO: make custom guard maybe
      });
      client.data.user = payload;
      client.data.chatId = chatId;
      context.user = payload;
      this.logger.log('Chat connection: token verified', { ...context });

      const chatUser = await this.chatUserRepository.findOne({
        where: {
          user_id: payload.sub,
          chat_id: chatId
        }
      });

      if (!chatUser) {
        this.logger.warn('Chat connection: user not allowed', { ...context });
        throw new BadRequestException('User is not allowed in this chat.')
      }
      this.logger.log(`Client connected: ${client.id}, User: ${payload.sub}`);
    } catch (error) {
      this.logger.error('Connection rejected:', { error, ...context });
      client.emit('error', {
        message: error.message || 'Unauthorized connection',
      });
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected:`, { id: client.id, chatId: client.data.chatId, userId: client.data.user.sub });
  }

  /**
   * Join a chat room
   */
  @SubscribeMessage('join')
  handleJoinChat(
    @ConnectedSocket() client: Socket
  ): void {
    const context = client.data;
    this.logger.log('Join request:', { ...context });
    rmqSend<any, any>(
      this.client,
      CHAT_MESSAGE_PATTERNS.GET_CHAT_HISTORY,
      {
        userId: client.data.user.sub,
        chatId: client.data.chatId
      },
      ({ success, result, error}) => {
        if (success) {
          this.logger.log('Join request: got chat history successfully.', { ...context });
          client.emit('getUserData', {
            id: client.data.user.sub,
            name: client.data.user.name
          });
          client.emit('getHistory', {
            result
          });
          client.join(client.data.chatId);
          this.logger.log(`Join request: Client ${client.id} joined chat room: ${client.data.chatId}`, { ...context });
        } else {
          this.logger.error('Join request: can not get chat history', error);
          const { message: errorMessage } = TekeroError(error);
          client.emit('error', { message: errorMessage });
          client.disconnect();
        }
      }
    );
  }

  /**
   * Send a message to a chat room
   */
  @SubscribeMessage('send')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { message: string }
  ): void {
    const context = client.data;
    this.logger.log('Send message:', { ...context });
    const { message } = payload;
    rmqSend<ISendMessage.Request, ISendMessage.Response>(
      this.client,
      CHAT_MESSAGE_PATTERNS.SEND_MESSAGE,
      {
        userId: client.data.user.sub,
        chatId: client.data.chatId,
        message
      },
      ({ success, result, error}) => {
        if (success) {
          this.logger.log('Send message: message sent.', { ...context });
          this.server.to(client.data.chatId).emit('receiveMessage', {
            sender: client.data.user.name,
            result,
          });
        } else {
          this.logger.error('Send message: Message can not be sent', { error, ...context });
          const { message: errorMessage } = TekeroError(error);
          client.emit('error', { message: errorMessage });
          client.disconnect();
        }
      }
    );
    this.logger.log(`Message sent to room ${client.data.chatId}: ${client.data.user.sub}: ${message}`);
  }

  @SubscribeMessage('upload-image')
  async handleUploadImage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { image: string; fileName: string; mimeType: string }
  ) {
    try {
      const { image, fileName, mimeType } = payload;
      const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

      // Simulate file-like object (similar to Multer)
      const file = {
        buffer,
        originalname: fileName,
        mimetype: mimeType || 'image/png',
        size: buffer.length,
      };

      // Upload the file using the existing mediaService
      let imageId;
      try {
        imageId = await this.mediaService.uploadMedia({
          userId: client.data.user.sub,
          file,
        });
      } catch (error) {
        return;
      }

      rmqSend(
        this.client,
        CHAT_MESSAGE_PATTERNS.UPLOAD_IMAGE,
        {
          userId: client.data.user.sub,
          chatId: client.data.chatId,
          imageId
        },
        ({ success, result, error}) => {
          if (success) {
            this.server.to(client.data.chatId).emit('receiveMessage', {
              sender: client.data.user.name,
              result
            });
          } else {
            console.log('ERROR', error);
          }
        }
      );
    } catch (error) {
      console.error('Upload failed:', error);
      client.emit('upload-failure', { success: false, error: error.message });
    }
  }
}
