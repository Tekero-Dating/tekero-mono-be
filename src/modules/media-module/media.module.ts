import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaRepository } from '../../contracts/db/models/mdeia.entity';
import { UserRepository } from '../../contracts/db/models/user.entity';
import { S3Service } from './s3.service';
import { ClientsModule } from '@nestjs/microservices';
import { generateRmqOptions } from '../../utils/rmq-utils.nest';
import {
  MEDIA_MODULE_QUEUES,
  MEDIA_SERVICE_NAME,
} from '../../contracts/media-interface/media.constants';
import { MediaAccessRepository } from '../../contracts/db/models/mdeia-access.entity';
import { MessageRepository } from '../../contracts/db/models/message.entity';
import { ChatUserRepository } from '../../contracts/db/models/chat-user.entity';

@Module({
  imports: [
    ClientsModule.register(
      generateRmqOptions(MEDIA_MODULE_QUEUES, MEDIA_SERVICE_NAME),
    ),
  ],
  controllers: [MediaController],
  providers: [
    MediaService,
    S3Service,
    MediaRepository,
    UserRepository,
    MediaAccessRepository,
    MessageRepository,
    ChatUserRepository,
  ],
})
export class MediaModule {}
