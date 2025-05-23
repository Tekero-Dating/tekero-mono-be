import { ConstitutionsEnum, GendersEnum } from '../db/models/enums';
import { RmqContext } from '@nestjs/microservices';
import { UserProfile } from '../db/models/user-profile.entity';
import { User } from '../db/models/user.entity';

export const USER_PROFILES_MSG_PATTERNS = {
  GET: 'get',
  UPDATE: 'update',
};

export namespace IGetUserProfile {
  export interface request {
    id: number;
  }
  export interface response {
    success: boolean;
    result?: UserProfile & { profile_owner: User };
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export namespace IUpdateUserProfile {
  export interface request {
    userId: string;
    height?: number;
    weight?: number;
    constitution?: ConstitutionsEnum;
    gender?: GendersEnum;
    bio?: string;
    profilePicture?: number;
    firstName?: string;
    lastName?: string;
    dob?: Date;
    homeLocation?: string;
    orientation?: number;
    sexuality?: number;
    playlist?: string;
  }
  export interface response {
    success: boolean;
    result?: {
      updated: boolean;
      profile: UserProfile & { profile_owner: User };
    };
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export interface IUserProfileController {
  getUserProfile: (
    payload: IGetUserProfile.request,
    context: RmqContext,
  ) => Promise<IGetUserProfile.response>;
  updateUserProfile: (
    payload: IUpdateUserProfile.request,
    context: RmqContext,
  ) => Promise<IUpdateUserProfile.response>;
}
