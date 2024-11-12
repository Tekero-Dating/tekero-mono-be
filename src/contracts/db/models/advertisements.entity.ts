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
import { validateAdvFilter } from './validators/advertisement.validator';

@Table({ modelName: 'advertisement' })
export class Advertisement extends Model {
  @Column
  active: boolean;

  @AllowNull(true)
  @Column
  activated: Date;

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
    validate: {
      async validateJSON(value: any) {
        const valid = validateAdvFilter(value);
        if (!valid) {
          throw new Error(`Invalid response format: ${JSON.stringify(validateAdvFilter.errors)}`);
        }
      }
    }
  })
  filter: {
    gender: GendersEnum[];
    genderExpressionFrom: number;
    genderExpressionTo: number;
    orientationFrom: number;
    orientationTo: number;
    distance: number;
    ageFrom: number;
    ageTo: number;
    heightFrom: number;
    heightTo: number;
    constitution: ConstitutionsEnum[];
  }

  @Column
  text: string;

  @Column({
    type: DataType.GEOGRAPHY('POINT', 4326)
  })
  location: { type: 'Point'; coordinates: [number, number] };

  @Column({
    type: DataType.ENUM,
    values: Object.keys(OpenersEnum)
  })
  opener: OpenersEnum;

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
