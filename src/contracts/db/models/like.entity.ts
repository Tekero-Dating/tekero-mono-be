import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
  DataType,
  AllowNull,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { Advertisement } from './advertisements.entity';

@Table({
  modelName: 'like',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'advertisement_id'],
      name: 'unique_user_advertisement',
    },
  ],
})
export class Like extends Model {
  @ForeignKey(() => Advertisement)
  @Column
  advertisement_id!: number;

  @BelongsTo(() => Advertisement, 'advertisement_id')
  advertisement!: Advertisement;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id!: string;

  @BelongsTo(() => User, 'user_id')
  user!: User;

  @Column({
    type: DataType.DATE,
  })
  expiration_date: Date;

  @Column({
    type: DataType.BOOLEAN,
  })
  rejected: boolean;

  @Column
  match: boolean;
}

export const LikeRepository = {
  // TODO: TypeError: Cannot read properties of undefined (reading 'GRINDER') when using  MODELS_REPOSITORIES_ENUM['GRINDER']
  provide: 'LIKE_REPOSITORY',
  useValue: Like,
};
