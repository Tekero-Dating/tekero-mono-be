import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
  AllowNull,
  IsUrl, BelongsToMany,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { Advertisement } from './advertisements.entity';
import { AdvertisementMedia } from './junctions/advertisement-media.entity';

@Table({ modelName: 'media' })
export class Media extends Model {
  @Column
  private: boolean;

  @Column
  hot: boolean;

  @IsUrl
  @Column
  url: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  user_id!: number;

  @BelongsTo(() => User, { foreignKeyConstraint: true })
  user?: User;

  @BelongsToMany(
    () => Advertisement, () => AdvertisementMedia
  )
  advertisements?: Advertisement[];
}

export const MediaRepository = {
  // TODO: TypeError: Cannot read properties of undefined (reading 'GRINDER') when using  MODELS_REPOSITORIES_ENUM['GRINDER']
  provide: 'MEDIA_REPOSITORY',
  useValue: Media
};
