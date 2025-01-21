import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Advertisement } from './advertisements.entity';
import { ChatTypesEnum } from './enums/chat-types.enum';

@Table({ modelName: 'chat' })
export class Chat extends Model {
  @ForeignKey(() => Advertisement)
  @Column
  advertisement_id!: number;
  @BelongsTo(() => Advertisement, 'advertisement_id')
  advertisement!: Advertisement;

  @Column({
    type: DataType.ENUM,
    values: Object.keys(ChatTypesEnum)
  })
  chat_type: ChatTypesEnum;
};

export const ChatRepository = {
  provide: 'CHAT_REPOSITORY',
  useValue: Chat
};
