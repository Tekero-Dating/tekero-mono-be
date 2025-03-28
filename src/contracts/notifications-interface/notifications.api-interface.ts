import { Like } from '../db/models/like.entity';
import { ILikeAd, IMatchAd } from '../likes-interface/likes.api-interface';

export namespace INReceiveLike {
  export interface Request {
    '0': ILikeAd.Request,
    like: NonNullable<ILikeAd.Response['result']>['like'],
    userStats: NonNullable<ILikeAd.Response['result']>['user_stats']
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

export namespace INMatch {
  export interface Request {
    '0': IMatchAd.Request,
    chat: NonNullable<IMatchAd.Response['result']>['chat'],
    likerStats: NonNullable<IMatchAd.Response['result']>['liker_stats'],
    authorStats: NonNullable<IMatchAd.Response['result']>['author_stats']
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

export interface INotificationsController {
  receiveLike(payload: INReceiveLike.Request): Promise<INReceiveLike.Response>;
  match(payload: INMatch.Request): Promise<INMatch.Response>;
}
