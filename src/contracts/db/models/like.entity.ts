import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey
} from 'sequelize-typescript';
import { User } from './user.entity';
import { Advertisement } from './advertisements.entity';

@Table({ modelName: 'like' })
export class Like extends Model {
  @ForeignKey(() => Advertisement)
  @Column
  advertisement_id!: number;

  @ForeignKey(() => User)
  @Column
  user_id!: number;

  @BelongsTo(() => Advertisement, 'advertisement_id')
  adv_id!: User;

  @BelongsTo(() => User, 'user_id')
  userId!: User;
}

export const LikeRepository = {
  // TODO: TypeError: Cannot read properties of undefined (reading 'GRINDER') when using  MODELS_REPOSITORIES_ENUM['GRINDER']
  provide: 'LIKE_REPOSITORY',
  useValue: Like
};
