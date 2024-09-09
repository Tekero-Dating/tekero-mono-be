import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
  AllowNull,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { ConstitutionsEnum, GendersEnum, OpenersEnum } from './enums';
import { AdTypesEnum } from './enums/ad-types.enum';
import { Media } from './mdeia.entity';
import { AdvertisementMedia } from './junctions/advertisement-media.entity';
import { AdStatusesEnum } from './enums/ad-statuses.enum';

@Table({ modelName: 'advertisement' })
export class Advertisement extends Model {
  @Column
  active: boolean;

  @Column({
    type: DataType.ENUM,
    values: Object.keys(AdTypesEnum)
  })
  type: AdTypesEnum;

  @Column({
    type: DataType.ENUM,
    values: Object.keys(AdStatusesEnum)
  })
  status: AdStatusesEnum;

  @Column({
    type: DataType.JSON,
  })
  filter: {
    gender?: GendersEnum[];
    sexualityFrom?: number;
    sexualityTo?: number;
    orientationFrom?: number;
    orientationTo?: number;
    location?: number | string;
    ageFrom?: number;
    ageTo?: number;
    constitution?: ConstitutionsEnum[];
  }

  @Column
  text: string;

  @Column
  location: string;

  @Column({
    type: DataType.ENUM,
    values: Object.keys(OpenersEnum)
  })
  opener: OpenersEnum;

  @Column
  openerQuestion: string;

  @Column
  song: string;

  @AllowNull(false)
  @Column
  duration: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  user_id!: number;
  @BelongsTo(() => User, { foreignKeyConstraint: true })
  user!: User;

  @BelongsToMany(() => Media, () => AdvertisementMedia)
  photos!: Media[];
}

export const AdvertisementsRepository = {
  // TODO: TypeError: Cannot read properties of undefined (reading 'GRINDER') when using  MODELS_REPOSITORIES_ENUM['GRINDER']
  provide: 'ADVERTISEMENTS_REPOSITORY',
  useValue: Advertisement
};
