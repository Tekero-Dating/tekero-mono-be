import { RmqContext } from '@nestjs/microservices';
import { Like } from '../db/models/like.entity';
import { UserStats } from '../db/models/user-stats.entity';
import { Chat } from '../db/models/chat.entity';

export const LIKES_MSG_PATTERNS = {
  SEND_LIKE: 'SEND_LIKE',
  DISMISS_LIKE: 'DISMISS_LIKE',
  REJECT_LIKE: 'REJECT_LIKE',
  MATCH: 'MATCH',
  GET_USER_LIKES: 'GET_USER_LIKES',
};

export namespace ILikeAd {
  export interface Request {
    userId: number;
    advertisementId: number;
  }
  export interface Response {
    success: boolean;
    result?: {
      like: Like;
      user_stats: UserStats;
    };
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export namespace IUnlikeAd {
  export interface Request {
    userId: number;
    advertisementId: number;
  }
  export interface Response {
    success: boolean;
    result?: {
      like: Like;
      user_stats: UserStats;
    };
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export namespace IRejectLike {
  export interface Request {
    userId: number;
    likeId: number;
  }
  export interface Response {
    success: boolean;
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export namespace IMatchAd {
  export interface Request {
    userId: number;
    likeId: number;
  }
  export interface Response {
    success: boolean;
    result?: {
      chat: Chat;
      author_stats: UserStats;
      liker_stats: UserStats;
    };
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export namespace IGetUserLikes {
  export interface Request {
    userId: number;
  }
  export interface Response {
    success: boolean;
    result?: Like[];
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export interface ILikesController {
  /**
   * Send like
   */
  sendLike: (
    payload: ILikeAd.Request,
    context: RmqContext,
  ) => Promise<ILikeAd.Response>;

  /**
   * Remove like
   */
  dismissLike: (
    payload: IUnlikeAd.Request,
    context: RmqContext,
  ) => Promise<IUnlikeAd.Response>;

  /**
   * Reject like, make refund to user
   * who sent a like
   */
  rejectLike: (
    payload: IRejectLike.Request,
    context: RmqContext,
  ) => Promise<IRejectLike.Response>;

  /**
   * Make a match with the user who liked.
   * Match opens a chat with all users who
   * related to liked adv
   */
  makeMatch: (
    payload: IMatchAd.Request,
    context: RmqContext,
  ) => Promise<IMatchAd.Response>;

  getUserLikes: (
    payload: IGetUserLikes.Request,
  ) => Promise<IGetUserLikes.Response>;
}
