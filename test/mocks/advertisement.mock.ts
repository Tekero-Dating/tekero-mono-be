import { AdTypesEnum } from '../../src/contracts/db/models/enums/ad-types.enum';
import {
  ConstitutionsEnum,
  GendersEnum,
  OpenersEnum,
} from '../../src/contracts/db/models/enums';

export const mockUserAdvRequest = {
  text: 'I just test the app',
  type: AdTypesEnum.DATE,
  openers: [OpenersEnum.TEXT],
  photos: [3, 4],
  targetFilters: {
    gender: [GendersEnum.TRANS_FEMALE],
    genderExpressionFrom: 50,
    genderExpressionTo: 70,
    orientationFrom: 50,
    orientationTo: 70,
    ageFrom: 22,
    ageTo: 25,
    heightFrom: 150,
    heightTo: 170,
    distance: 100,
    constitution: [
      ConstitutionsEnum.CURVY,
      ConstitutionsEnum.AVERAGE,
      ConstitutionsEnum.SKINNY,
    ],
  },
  location: {
    type: 'Point',
    coordinates: [429686.70192539, 4582259.1043529],
  } as { type: 'Point'; coordinates: [number, number] },
};
