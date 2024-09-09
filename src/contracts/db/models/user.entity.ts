import {
  Table,
  Column,
  Model,
  Length,
  IsEmail,
  ForeignKey, DataType, Unique, AllowNull, HasOne,
} from 'sequelize-typescript';
import { Media } from './mdeia.entity';
import { GendersEnum } from './enums';
import { IsOptional } from 'class-validator';
import { UserProfile } from './user-profile.entity';

@Table({ modelName: 'user' })
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

  @AllowNull(true)
  @Column
  validated?: boolean;

  @AllowNull(true)
  @Column
  balance?: number;

  @ForeignKey(() => Media)
  @AllowNull(true)
  @Column
  profile_pic_id?: number;

  @HasOne(() => UserProfile)
  userProfile: UserProfile;
}

export const UserRepository = {
  //  TODO: TypeError: Cannot read properties of undefined (reading 'GRINDER') when using  MODELS_REPOSITORIES_ENUM['GRINDER']
  provide: 'USER_REPOSITORY',
  useValue: User
};
