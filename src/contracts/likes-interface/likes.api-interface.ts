import { RmqContext } from '@nestjs/microservices';
import { Like } from '../db/models/like.entity';
import { UserStats } from '../db/models/user-stats.entity';

export const LIKES_MSG_PATTERNS = {
  SEND_LIKE: 'SEND_LIKE',
  DISMISS_LIKE: 'DISMISS_LIKE'
};

export namespace ILikeAd {
  export interface Request {
    userId: number;
    advertisementId: number;
  };
  export interface Response {
    success: boolean;
    error?: Record<string, any> | {
      status: number;
      message: string;
    };
  };
};

export namespace IUnlikeAd {
  export interface Request {
    userId: number;
    advertisementId: number;
  };
  export interface Response {
    success: boolean;
    result?: {
      like: Like;
      user_stats: UserStats;
    };
    error?: Record<string, any> | {
      status: number;
      message: string;
    };
  };
};

export interface ILikesController {
  /**
   * Send like
   */
  sendLike: (payload: ILikeAd.Request, context: RmqContext) => Promise<ILikeAd.Response>;

  /**
   * Remove like
   */
  dismissLike: (payload: IUnlikeAd.Request, context: RmqContext) => Promise<IUnlikeAd.Response>;
}
