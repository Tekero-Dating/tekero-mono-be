import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
  AllowNull
} from 'sequelize-typescript';
import { User } from './user.entity';

@Table({ modelName: 'user-settings' })
export class UserSettings extends Model {
  @Column
  hide_accurate_location: boolean;

  @Column
  tokens: number;

  @Column
  hide_activity_status: boolean;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  user_id!: number;

  @BelongsTo(() => User, { foreignKeyConstraint: true })
  user!: User;
}

export const UserSettingsRepository = {
  // TODO: TypeError: Cannot read properties of undefined (reading 'GRINDER') when using  MODELS_REPOSITORIES_ENUM['GRINDER']
  provide: 'USER_SETTINGS_REPOSITORY',
  useValue: UserSettings
};
