import {
  Table,
  Column,
  Model,
  Length,
  IsEmail,
  ForeignKey,
  DataType,
  Unique,
  AllowNull,
  HasOne,
} from 'sequelize-typescript';
import { Media } from './mdeia.entity';
import { UserProfile } from './user-profile.entity';

@Table({
  modelName: 'user',
  indexes: [{ fields: ['dob'] }, { using: 'GIST', fields: ['location'] }],
})
export class User extends Model {
  @Length({ min: 2 })
  @AllowNull(false)
  @Column
  firstName: string;

  @Length({ min: 2 })
  @AllowNull(false)
  @Column
  lastName: string;

  @Column
  dob: Date;

  @Unique
  @IsEmail
  @Column
  email: string;

  @Column
  password: string;

  @AllowNull(true)
  @Column
  validated?: boolean;

  @AllowNull(true)
  @Column
  balance?: number; // TODO: move to userStats

  @ForeignKey(() => Media)
  @AllowNull(true)
  @Column
  profile_pic_id?: number;

  @HasOne(() => UserProfile)
  userProfile: UserProfile;

  @Column({
    type: DataType.GEOGRAPHY('POINT', 4326),
  })
  location: { type: 'Point'; coordinates: [number, number] };

  get age(): number {
    const diff = Date.now() - new Date(this.dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }
}

export const UserRepository = {
  //  TODO: TypeError: Cannot read properties of undefined (reading 'GRINDER') when using  MODELS_REPOSITORIES_ENUM['GRINDER']
  provide: 'USER_REPOSITORY',
  useValue: User,
};
