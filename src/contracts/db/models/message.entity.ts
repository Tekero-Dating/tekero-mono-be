import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Chat } from './chat.entity';
import { User } from './user.entity';
import { MessageTypesEnum } from './enums/message-types.enum';
import { Media } from './mdeia.entity';

@Table({ modelName: 'message' })
export class Message extends Model {
  @ForeignKey(() => Chat)
  @Column
  chat_id!: number;
  @BelongsTo(() => Chat, 'chat_id')
  chat!: Chat;

  @ForeignKey(() => User)
  @Column
  user_id!: number;
  @BelongsTo(() => User, 'user_id')
  user!: User;

  @AllowNull
  @ForeignKey(() => Media)
  @Column
  media_id!: number;
  @BelongsTo(() => Media, 'media_id')
  media!: Media;

  @Column({
    type: DataType.ENUM,
    values: Object.keys(MessageTypesEnum),
  })
  type: MessageTypesEnum;

  @AllowNull
  @Column
  content: string;

  @Column
  read: boolean;
}

export const MessageRepository = {
  provide: 'MESSAGE_REPOSITORY',
  useValue: Message,
};
