import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
  AllowNull,
  IsUrl,
  BelongsToMany,
  DataType,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { Advertisement } from './advertisements.entity';
import { AdvertisementMedia } from './junctions/advertisement-media.entity';
import { MediaTypesEnum } from './enums/media-types.enum';

@Table({ modelName: 'media', indexes: [{ fields: ['user_id'] }] })
export class Media extends Model {
  @Column
  private: boolean;

  @Column({
    type: DataType.ENUM,
    values: Object.keys(MediaTypesEnum),
  })
  media_type: MediaTypesEnum;

  @AllowNull
  @Column
  expiration?: number;

  @AllowNull
  @Column
  opened?: boolean;

  @IsUrl
  @Column
  url: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  user_id!: number;

  @BelongsTo(() => User, { foreignKeyConstraint: true })
  user?: User;

  @BelongsToMany(() => Advertisement, () => AdvertisementMedia)
  advertisements?: Advertisement[];
}

export const MediaRepository = {
  // TODO: TypeError: Cannot read properties of undefined (reading 'GRINDER') when using  MODELS_REPOSITORIES_ENUM['GRINDER']
  provide: 'MEDIA_REPOSITORY',
  useValue: Media,
};
