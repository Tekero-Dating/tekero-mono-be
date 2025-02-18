import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PresenceGateway } from './presence.gateway';
import { PresenceService } from './presence.service';
import { JWT_SECRET, JWT_TOKEN_TTL } from '../../config/config';
import { ClientsModule } from '@nestjs/microservices';
import { generateRmqOptions } from '../../utils/rmq-utils.nest';
import { NOTIFICATIONS_MODULE_QUEUES } from '../../contracts/notifications-interface/notifications.constants';
import { PRESENCE_SERVICE_NAME } from '../../contracts/presence-interface/presence.constants';

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: {
        expiresIn: JWT_TOKEN_TTL
      }
    }),
    ClientsModule.register(
      generateRmqOptions([NOTIFICATIONS_MODULE_QUEUES[1]], PRESENCE_SERVICE_NAME)
    )
  ],
  providers: [PresenceGateway, PresenceService],
  exports: [PresenceGateway, PresenceService],
})
export class PresenceModule {}
