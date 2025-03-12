import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { NotificationTypesEnum } from './enums/notification-types.enum';

@Table({ modelName: 'notification' })
export class Notification extends Model {
  @ForeignKey(() => User)
  @Column
  user_id!: number;

  @BelongsTo(() => User, 'user_id')
  userId!: User;

  @Column({
    type: DataType.JSON,
  })
  payload: Record<string, unknown>;

  @Column({
    type: DataType.ENUM(...Object.values(NotificationTypesEnum))
  })
  type: NotificationTypesEnum;

  @Column
  acknowledged: boolean;
}

export const NotificationRepository = {
  // TODO: TypeError: Cannot read properties of undefined (reading 'NOTIFICATION') when using  MODELS_REPOSITORIES_ENUM['NOTIFICATION']
  provide: 'NOTIFICATION_REPOSITORY',
  useValue: Notification,
};
