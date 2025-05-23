import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { Chat } from './chat.entity';

@Table({ modelName: 'chat-user' })
export class ChatUser extends Model {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id!: string;
  @BelongsTo(() => User, 'user_id')
  user!: User;

  @ForeignKey(() => Chat)
  @Column
  chat_id!: number;
  @BelongsTo(() => Chat, 'chat_id')
  chat!: Chat;
}

export const ChatUserRepository = {
  provide: 'CHAT_USER_REPOSITORY',
  useValue: ChatUser,
};
