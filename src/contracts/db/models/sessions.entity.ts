import {
  Model,
  Column,
  Table,
  DataType,
  ForeignKey,
  AllowNull,
  BelongsTo,
} from 'sequelize-typescript';
import { SessionStatesEnum } from './enums/session-states.enum';
import { User } from './user.entity';

export interface UserFingerprint {
  ip: string | null;
  userAgent: string | undefined;
  accept: string | undefined;
  acceptLanguage: string | undefined;
  acceptEncoding: string | string[] | undefined;
  referer: string | string[] | undefined;
  connection: string | undefined;
  timestamp: string;
}

@Table({ modelName: 'session' })
export class Session extends Model {
  @Column
  access_token: string;

  @Column
  refresh_token: string;

  @Column
  rt_expiration_date: Date;

  @Column
  at_expiration_date: Date;

  @Column({
    type: DataType.JSON,
  })
  fingerprint: UserFingerprint;

  @Column({
    type: DataType.ENUM,
    values: Object.keys(SessionStatesEnum),
  })
  session_state: SessionStatesEnum;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  user_id!: number;
  @BelongsTo(() => User, { foreignKeyConstraint: true })
  user!: User;
}

export const SessionsRepository = {
  // TODO: TypeError: Cannot read properties of undefined (reading 'SESSIONS_REPOSITORY') when using  MODELS_REPOSITORIES_ENUM['SESSIONS_REPOSITORY']
  provide: 'SESSIONS_REPOSITORY',
  useValue: Session,
};
