import { AdTypesEnum } from '../db/models/enums/ad-types.enum';
import { ConstitutionsEnum, GendersEnum, OpenersEnum } from '../db/models/enums';
import { Advertisement } from '../db/models/advertisements.entity';
import { RmqContext } from '@nestjs/microservices';

export const ADS_MSG_PATTERNS = {
  CREATE: 'create',
  EDIT: 'edit',
  ARCHIVE: 'archive',
  ACTIVITY: 'activity',
  STATS: 'stats'
};


export namespace ICreateAdv {
  export interface Request {
    userId: number;
    fields: IAdvFields;
  };
  export interface Response {
    success: boolean;
    result?: Advertisement;
    error?: Record<string, any> | {
      status: number;
      message: string;
    };
  }
}

export interface IAdvFields {
  text?: string;
  photos?: number[];
  type: AdTypesEnum;
  filter?: {
    gender?: GendersEnum[];
    sexualityFrom?: number;
    sexualityTo?: number;
    orientationFrom?: number;
    orientationTo?: number;
    location?: number | string;
    ageFrom?: number;
    ageTo?: number;
    constitution?: ConstitutionsEnum[];
  };
  opener?: OpenersEnum;
  openerQuestion?: string;
  song?: string;
}

export namespace IEditAdv {
  export interface Request {
    advId: number;
    fields: Partial<IAdvFields>;
  };
  export interface Response {
    success: boolean;
    result?: Advertisement;
    error?: Record<string, any> | {
      status: number;
      message: string;
    };
  }
}

export namespace IArchiveAdv {
  export interface Request {
    userId: number;
    advId: number;
    reason: string;
  };
  export interface Response {
    success: boolean;
    error?: Record<string, any> | {
      status: number;
      message: string;
    };
  }
}

export namespace IGetAdvActivity {
  export interface Request {
    userId: number;
    advId: number;
  };
  export interface Response {
    success: boolean;
    result?: IAdvActivity;
    error?: Record<string, any> | {
      status: number;
      message: string;
    };
  }
}

export interface IAdvLikes {
  userId: number;
  fullName: string;
  dob: string;
  message?: string;
  expirationDate: number;
}

export interface IAdvActivity {
  likes: IAdvLikes[];
  matches: IAdvLikes[];
}

export interface IAdvStats {
  likes: IAdvLikes[];
  matches: IAdvLikes[];
  visits: {
    userId: number;
    date: number;
  }[];
}

export interface IAdsController {
  createAdv: (payload: ICreateAdv.Request, context: RmqContext) => Promise<ICreateAdv.Response>
  editAdv: (payload: IEditAdv.Request, context: RmqContext) => Promise<IEditAdv.Response>
  archiveAdv: (payload: IArchiveAdv.Request, context: RmqContext) => Promise<IArchiveAdv.Response>

  getAdvActivity: (payload: IGetAdvActivity.Request, context: RmqContext) => Promise<IGetAdvActivity.Response> // TODO: replace with actual activity
  getAdvStats: (payload: IGetAdvActivity.Request, context: RmqContext) => Promise<IGetAdvActivity.Response> // TODO: replace with actual stats
};
