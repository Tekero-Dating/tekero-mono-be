import { AdTypesEnum } from '../db/models/enums/ad-types.enum';
import {
  ConstitutionsEnum,
  GendersEnum,
  OpenersEnum,
} from '../db/models/enums';
import { Advertisement } from '../db/models/advertisements.entity';
import { RmqContext } from '@nestjs/microservices';

export const ADS_MSG_PATTERNS = {
  CREATE: 'create',
  EDIT: 'edit',
  ARCHIVE: 'archive',
  SUIT_ADS: 'suitable_ads',
  ACTIVATE_ADV: 'activate_adv',
};

export namespace ICreateAdv {
  export interface Request {
    userId: string;
    fields: IAdvFields;
  }
  export interface Response {
    success: boolean;
    result?: Advertisement;
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export interface IAdvFilters {
  gender?: GendersEnum[];
  genderExpressionFrom?: number;
  genderExpressionTo?: number;
  orientationFrom?: number;
  orientationTo?: number;
  distance?: number;
  ageFrom?: number;
  ageTo?: number;
  heightFrom?: number;
  heightTo?: number; // TODO: remove body-shaming filters
  constitution?: ConstitutionsEnum[];
}

export interface IAdvFields {
  text?: string;
  photos?: number[];
  type: AdTypesEnum;
  targetFilters?: IAdvFilters;
  openers?: string[];
  song?: string;
  location: { type: 'Point'; coordinates: [number, number] };
  travelsTo?: { type: 'Point'; coordinates: [number, number] };
  travelDateFrom?: string;
  travelDateTo?: string;
}

export namespace IEditAdv {
  export interface Request {
    userId: string;
    advId: number;
    fields: Partial<IAdvFields>;
  }
  export interface Response {
    success: boolean;
    result?: Advertisement;
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export namespace IArchiveAdv {
  export interface Request {
    userId: string;
    advId: number;
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

export namespace IPublishAdv {
  export interface Request {
    userId: string;
    advId: number;
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

export namespace IGetSuitableAds {
  export interface Request {
    userId: string;
    filters: IAdvFilters;
    location: { type: 'Point'; coordinates: [number, number] };
    distance: number;
  }
  export interface Response {
    success: boolean;
    result?: Advertisement[];
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export interface IAdsController {
  /**
   * Creates an advertisement
   */
  createAdv: (
    payload: ICreateAdv.Request,
    context: RmqContext,
  ) => Promise<ICreateAdv.Response>;

  /**
   * Edits an advertisement
   */
  editAdv: (
    payload: IEditAdv.Request,
    context: RmqContext,
  ) => Promise<IEditAdv.Response>;

  /**
   * Change status of advertisement to archive
   * Notice that adv could be only archived and
   * can't be restored
   */
  archiveAdv: (
    payload: IArchiveAdv.Request,
    context: RmqContext,
  ) => Promise<IArchiveAdv.Response>;

  /**
   * Get advertisements that are suitable
   * according to the expectations of the user
   * who search for adv and user who posts the adv
   */
  getSuitableAdvertisements: (
    payload: IGetSuitableAds.Request,
    context: RmqContext,
  ) => Promise<IGetSuitableAds.Response>;

  /**
   * Publishing created advertisement
   */
  publishAdv: (
    payload: IPublishAdv.Request,
    context: RmqContext,
  ) => Promise<IPublishAdv.Response>;
}
