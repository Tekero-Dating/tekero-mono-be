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
  PrimaryKey,
} from 'sequelize-typescript';
import { Media } from './mdeia.entity';
import { UserProfile } from './user-profile.entity';

@Table({
  modelName: 'user',
  indexes: [{ fields: ['dob'] }, { using: 'GIST', fields: ['location'] }],
})
export class User extends Model {
  @PrimaryKey
  @Column(DataType.UUID)
  override id: string;

  @Length({ min: 2 })
  @AllowNull(false)
  @Column
  firstName?: string;

  @Length({ min: 2 })
  @AllowNull(false)
  @Column
  lastName?: string;

  @Column
  dob?: Date;

  @Unique
  @IsEmail
  @Column
  email: string;

  @Column
  password?: string;

  @HasOne(() => UserProfile)
  userProfile: UserProfile;

  @Column({
    type: DataType.GEOGRAPHY('POINT', 4326),
  })
  location: { type: 'Point'; coordinates: [number, number] };

  get age(): number {
    const diff = Date.now() - new Date(this.dob || 0).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }
}

export const UserRepository = {
  //  TODO: TypeError: Cannot read properties of undefined (reading 'GRINDER') when using  MODELS_REPOSITORIES_ENUM['GRINDER']
  provide: 'USER_REPOSITORY',
  useValue: User,
};
