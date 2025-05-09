import {
  Table,
  Model,
  ForeignKey,
  AllowNull,
  Column,
  BelongsTo,
  Max,
  DataType,
} from 'sequelize-typescript';
import { User } from './user.entity';

@Table({ modelName: 'user-stats', indexes: [{ fields: ['user_id'] }] })
export class UserStats extends Model {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  user_id!: number;

  @BelongsTo(() => User)
  profile_owner!: User;

  @Max(5)
  @Column
  available_active_chats: number;

  @Max(10)
  @Column
  available_likes_to_send: number;

  @Max(10)
  @Column
  available_likes_to_receive: number;

  @Column({
    type: DataType.DATE,
  })
  available_likes_refilled_date: Date;
}

export const UserStatsRepository = {
  provide: 'USER_STATS_REPOSITORY',
  useValue: UserStats,
};
