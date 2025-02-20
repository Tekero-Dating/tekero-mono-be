import { Module } from '@nestjs/common';
import { ChatUserRepository } from '../../contracts/db/models/chat-user.entity';
import { ChatGateway } from './chat.gateway';
import { ChatRepository } from '../../contracts/db/models/chat.entity';
import { JwtService } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ClientsModule } from '@nestjs/microservices';
import { generateRmqOptions } from '../../utils/rmq-utils.nest';
import {
  CHAT_MODULE_QUEUES,
  CHAT_SERVICE_NAME,
} from '../../contracts/chats-interface/chats.constants';
import { ChatService } from './chat.service';
import { MessageRepository } from '../../contracts/db/models/message.entity';
import { MediaService } from '../media-module/media.service';
import { MediaModule } from '../media-module/media.module';
import { MediaRepository } from '../../contracts/db/models/mdeia.entity';
import { MediaAccessRepository } from '../../contracts/db/models/mdeia-access.entity';
import { UserRepository } from '../../contracts/db/models/user.entity';
import { S3Service } from '../media-module/s3.service';

@Module({
  imports: [
    ClientsModule.register(
      generateRmqOptions(CHAT_MODULE_QUEUES, CHAT_SERVICE_NAME),
    ),
    MediaModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatUserRepository,
    ChatRepository,
    MessageRepository,
    MediaRepository,
    MediaAccessRepository,
    UserRepository,
    JwtService,
    ChatService,
    MediaService,
    S3Service,
  ],
})
export class ChatModule {}
