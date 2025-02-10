import { Like } from '../db/models/like.entity';

export namespace INReceiveLike {
  export interface Request {
    userId: number;
    advertisementId: number;
    like: Like;
  };
  export interface Response {
    success: boolean;
    error?: Record<string, any> | {
      status: number;
      message: string;
    };
  };
};


export interface INotificationsController {
  receiveLike(payload: INReceiveLike.Request): Promise<INReceiveLike.Response>;
}
