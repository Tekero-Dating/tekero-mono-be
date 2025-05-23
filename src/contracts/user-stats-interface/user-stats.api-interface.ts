import { UserStats } from '../db/models/user-stats.entity';

export namespace IGetUSerStats {
  export interface Request {
    userId: string;
  }
  export interface Response {
    success: boolean;
    result?: UserStats;
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export namespace ISetLikesToSendLimit {
  export interface Request {
    userId: string;
    amountToSet: number;
  }
  export interface Response {
    success: boolean;
    result?: UserStats;
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export namespace ISetLikesToReceiveLimit {
  export interface Request {
    userId: string;
    amountToSet: number;
  }
  export interface Response {
    success: boolean;
    result?: UserStats;
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export namespace ISetActiveChatLimit {
  export interface Request {
    userId: string;
    amountToSet: number;
  }
  export interface Response {
    success: boolean;
    result?: UserStats;
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export interface IUSerStatsController {
  getUserStats: (
    payload: IGetUSerStats.Request,
  ) => Promise<IGetUSerStats.Response>;

  setLikesToSendLimit: (
    payload: ISetLikesToSendLimit.Request,
  ) => Promise<ISetLikesToSendLimit.Response>;

  setLikedToReceiveLimit: (
    payload: ISetLikesToReceiveLimit.Request,
  ) => Promise<ISetLikesToReceiveLimit.Response>;

  setActiveChatLimit: (
    payload: ISetActiveChatLimit.Request,
  ) => Promise<ISetActiveChatLimit.Response>;
}
