import {
  Table,
  Column,
  Model,
  BelongsTo,
  DataType,
  Min,
  Max,
  IsUrl,
  ForeignKey,
  AllowNull,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { ConstitutionsEnum, GendersEnum, OrientationsEnum } from './enums';
import { Media } from './mdeia.entity';

@Table({
  modelName: 'user-profile',
  indexes: [
    { fields: ['user_id'] },
    {
      name: 'user_profile_full_filter_idx',
      fields: [
        'user_id',
        'constitution',
        'sex',
        'height',
        'weight',
        'gender_expression',
      ],
    },
  ],
})
export class UserProfile extends Model {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id!: string;

  @BelongsTo(() => User)
  profile_owner!: User;

  @Column
  home_location?: string;

  @Column({
    type: DataType.ENUM,
    values: Object.keys(OrientationsEnum),
  })
  orientation?: OrientationsEnum;

  @Column({
    type: DataType.ENUM,
    values: Object.keys(GendersEnum),
  })
  sex?: GendersEnum;

  @Min(1)
  @Max(100)
  @Column
  gender_expression?: number;

  @Min(1)
  @Max(210)
  @Column
  height?: number;

  @Min(30)
  @Max(190)
  @Column
  weight?: number;

  @Column
  bio?: string;

  @IsUrl
  @Column
  playlist?: string;

  @AllowNull(true)
  @Column({
    type: DataType.ENUM,
    values: Object.keys(ConstitutionsEnum),
  })
  constitution?: ConstitutionsEnum;

  @ForeignKey(() => Media)
  @AllowNull(true)
  @Column
  profile_pic_id?: number;
}

export const UserProfileRepository = {
  //  TypeError: Cannot read properties of undefined (reading 'GRINDER') when using  MODELS_REPOSITORIES_ENUM['GRINDER']
  provide: 'USER_PROFILE_REPOSITORY',
  useValue: UserProfile,
};
