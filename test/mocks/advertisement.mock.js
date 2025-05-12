"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockUserAdvRequest = void 0;
var ad_types_enum_1 = require("../../src/contracts/db/models/enums/ad-types.enum");
var enums_1 = require("../../src/contracts/db/models/enums");
exports.mockUserAdvRequest = {
    text: 'I just test the app',
    type: ad_types_enum_1.AdTypesEnum.DATE,
    openers: [enums_1.OpenersEnum.TEXT],
    photos: [3, 4],
    targetFilters: {
        gender: [enums_1.GendersEnum.TRANS_FEMALE],
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
            enums_1.ConstitutionsEnum.CURVY,
            enums_1.ConstitutionsEnum.AVERAGE,
            enums_1.ConstitutionsEnum.SKINNY,
        ],
    },
    location: {
        type: 'Point',
        coordinates: [429686.70192539, 4582259.1043529],
    },
};
