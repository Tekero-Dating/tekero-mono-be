import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, WebSocketServer,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { PresenceService } from './presence.service';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { PRESENCE_SERVICE_NAME } from '../../contracts/presence-interface/presence.constants';
import { rmqSend } from '../../utils/rmq-utils.nest';
import { CHAT_MESSAGE_PATTERNS } from '../../contracts/chats-interface/chats.constants';
import { TekeroError } from '../../utils/error-handling-utils';
import {
  NOTIFICATIONS_MODULE_QUEUES,
  NOTIFICATIONS_MSG_PATTERNS,
} from '../../contracts/notifications-interface/notifications.constants';
import { RmqService } from '../../utils/rmq-module/rmq.service';
import * as amqp from 'amqplib';
import { RMQ_QUEUE_PREFIX } from '../../config/config';

@WebSocketGateway({
  namespace: 'presence',
  cors: {
    origin: '*'
  }
})
export class PresenceGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(PresenceGateway.name);
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly rmqService: RmqService,
    private jwtService: JwtService,
    private presenceService: PresenceService,
  ) {}

  async onModuleInit() {
    await this.startConsumer();
  }

  private async startConsumer() {
    this.logger.log('startConsumer: starts consumer');
    await this.rmqService.consume(`${RMQ_QUEUE_PREFIX}${NOTIFICATIONS_MODULE_QUEUES[1]}`, async (msg: amqp.ConsumeMessage) => {
      const content = JSON.parse(msg.content.toString());
      await this.sendInAppNotification(content);
    });
  }

  afterInit() {
    this.logger.log('WebSocket Presence Gateway Initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token as string;
      if (!token) {
        throw new Error('Token not provided');
      }
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      this.logger.log(`Client connected: userId ${userId}`);
      await this.presenceService.setOnline(userId, client.id);
      client.data.userId = userId;
    } catch (error) {
      this.logger.error('Authentication failed during WS connection', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.logger.log(`Client disconnected: userId ${userId}`);
      await this.presenceService.removeOnline(userId);
    }
  }

  @SubscribeMessage('set-online')
  handleJoin (
    @ConnectedSocket() client: Socket
  ): void {
    const context = client.data;
    this.logger.log('Join request:', { ...context });
    client.join(String(client.data.userId));
  }

  sendInAppNotification(
      payload: { userId: number, notificationId: number }
    ) {
    console.log({ payload });
    this.logger.log('sendInAppNotification', { payload });
    this.server.to(String(payload.userId)).emit('receiveNotification', {
      payload
    });
    return { success: true };
  }
}
