import { User } from '../db/models/user.entity';
import { UserStats } from '../db/models/user-stats.entity';
import { UserProfile } from '../db/models/user-profile.entity';
import { RmqContext } from '@nestjs/microservices';
import { UserSettings } from '../db/models/user-settings.entity';

export interface IUserFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dob: Date;
  validated?: boolean;
  profile_pic_id?: number;
};

export namespace ICreateUser {
  export interface Request extends IUserFields {};
  export interface Response {
    success: boolean;
    result?: {
      user: User;
      userStats: UserStats;
      userProfile: UserProfile;
      userSettings: UserSettings;
    }
    error?: Record<string, any> | {
      status: number;
      message: string;
    };
  };
};

export namespace IDeleteUser {
  export interface Request {
    userId: number;
    reason: string;
  };
  export interface Response {
    success: boolean;
    error?: Record<string, any> | {
      status: number;
      message: string;
    };
  };
};

export namespace IEditUser {
  export interface Request {
    userId: number;
    fields: IUserFields;
  };
  export interface Response {
    success: boolean;
    result?: {
      user: User;
    }
    error?: Record<string, any> | {
      status: number;
      message: string;
    };
  };
};

export interface IUsersController {
  /**
   * Creates user, userStats, userProfile
   */
  createUser: (payload: ICreateUser.Request, context: RmqContext) => Promise<ICreateUser.Response>;

  /**
   * Deletes all user data, user, profile and stats
   */
  deleteUser: (payload: IDeleteUser.Request, context: RmqContext) => Promise<IDeleteUser.Response>;

  /**
   * Edits user details. Just put any fields in a payload to edit them
   */
  editUser: (payload: IEditUser.Request, context: RmqContext) => Promise<IEditUser.Response>;
};
