import { RmqContext } from '@nestjs/microservices';

export namespace IUploadMedia {
  export interface Request {
    userId: string;
    expiration?: number;
    file: Express.Multer.File;
  }
  export interface Response {
    success: boolean;
    result?: {
      mediaId: number;
    };
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export namespace IGetMedia {
  export interface Request {
    userId: string;
    mediaId: number;
  }
  export type Response = {
    success: boolean;
    result?: {
      url: string;
    };
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  };
}

export namespace IDeleteMedia {
  export interface Request {
    userId: string;
    mediaId: number;
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

export namespace ISetMediaPrivacy {
  export interface Request {
    userId: string;
    mediaId: number;
  }
  export interface Response {
    success: boolean;
    result?: {
      private: boolean;
    };
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export namespace IEditMediaAccess {
  export interface Request {
    ownerId: string;
    accessorId: string;
    giver: boolean;
  }
  export interface Response {
    success: boolean;
    result?: {
      allowed: boolean;
    };
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export interface IMediaService {
  uploadMedia(payload: IUploadMedia.Request): Promise<IGetMedia.Response>;
}

export interface IMediaController {
  getMedia(
    payload: IGetMedia.Request,
    context: RmqContext,
  ): Promise<IGetMedia.Response>;
  deleteMedia(
    payload: IDeleteMedia.Request,
    context: RmqContext,
  ): Promise<IDeleteMedia.Response>;
  setMediaPrivacy(
    payload: ISetMediaPrivacy.Request,
    context: RmqContext,
  ): Promise<ISetMediaPrivacy.Response>;
  editMediaAccess(
    payload: IEditMediaAccess.Request,
    context: RmqContext,
  ): Promise<IEditMediaAccess.Response>;
}
