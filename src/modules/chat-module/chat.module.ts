import { Module } from '@nestjs/common';
import { ChatUserRepository } from '../../contracts/db/models/chat-user.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatRepository } from '../../contracts/db/models/chat.entity';

@Module({
  imports: [],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatUserRepository,
    ChatRepository
  ]
})
export class ChatModule {}
