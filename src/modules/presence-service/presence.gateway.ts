import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  WebSocketServer
} from '@nestjs/websockets';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { PresenceService } from './presence.service';
import { NOTIFICATIONS_MSG_PATTERNS } from '../../contracts/notifications-interface/notifications.constants';
import { ClientProxy, Ctx, MessagePattern } from '@nestjs/microservices';
import { PRESENCE_SERVICE_NAME } from '../../contracts/presence-interface/presence.constants';

@Injectable()
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
    private jwtService: JwtService,
    private readonly presenceService: PresenceService,
    @Inject(PRESENCE_SERVICE_NAME)
    private readonly client: ClientProxy
  ) {}

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

  @MessagePattern(NOTIFICATIONS_MSG_PATTERNS.NOTIFY)
  sendInAppNotification(
      payload: { userId: number, notificationId: number }
  ): void {
    this.logger.log('sendInAppNotification', { payload });
    this.server.to(String(payload.userId)).emit('receiveNotification', {
      payload
    });
  }
}
