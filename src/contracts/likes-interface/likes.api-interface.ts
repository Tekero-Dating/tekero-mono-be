import { RmqContext } from '@nestjs/microservices';

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
