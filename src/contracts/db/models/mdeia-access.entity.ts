import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './user.entity';

@Table({ modelName: 'media-access' })
export class MediaAccess extends Model {
  @ForeignKey(() => User)
  @Column
  owner_id!: number;

  @ForeignKey(() => User)
  @Column
  accessor_id!: number;

  @BelongsTo(() => User, 'owner_id')
  owner!: User;

  @BelongsTo(() => User, 'accessor_id')
  accessor!: User;
}

export const MediaAccessRepository = {
  // TODO: TypeError: Cannot read properties of undefined (reading 'GRINDER') when using  MODELS_REPOSITORIES_ENUM['GRINDER']
  provide: 'MEDIA_ACCESS_REPOSITORY',
  useValue: MediaAccess
};
