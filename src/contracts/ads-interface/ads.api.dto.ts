import { IsArray, IsEnum, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ConstitutionsEnum, GendersEnum, OpenersEnum } from '../db/models/enums';
import { IAdvFields } from './ads.api-interface';
import { AdTypesEnum } from '../db/models/enums/ad-types.enum';
import { Type } from 'class-transformer';

/**
 * I fucked up with the default values for ads. The problem comes
 * when user try to update some fields. In that case we need t extend
 * createAdvDTO and make all optional but during the update of single field
 * it gives the default values for all the other fields. Because of it here
 * we have tons of duplicated code. TODO
 */

export class AdTargetFiltersDTO {
  @IsOptional()
  @IsEnum(GendersEnum, {
    message: 'Gender does not match any of existing',
    each: true
  })
  gender?: GendersEnum[] = [
    GendersEnum.FEMALE,
    GendersEnum.MALE,
    GendersEnum.NON_BINARY,
    GendersEnum.TRANS_FEMALE,
    GendersEnum.TRANS_MALE
  ];

  @IsOptional()
  @IsNumber()
  genderExpressionFrom?: number = 0;

  @IsOptional()
  @IsNumber()
  genderExpressionTo?: number = 100;

  @IsOptional()
  @IsNumber()
  orientationFrom?: number = 0;

  @IsOptional()
  @IsNumber()
  orientationTo?: number = 100;

  @IsOptional()
  @IsNumber()
  distance?: number = 100;

  @IsOptional()
  @IsNumber()
  ageFrom?: number = 18;

  @IsOptional()
  @IsNumber()
  ageTo?: number = 118;

  @IsOptional()
  @IsNumber()
  heightFrom?: number = 100;

  @IsOptional()
  @IsNumber()
  heightTo?: number = 250;

  @IsOptional()
  @IsEnum(ConstitutionsEnum, {
    message: 'Constitutions does not match any of existing',
    each: true
  })
  constitution?: ConstitutionsEnum[] = [
    ConstitutionsEnum.SKINNY,
    ConstitutionsEnum.AVERAGE,
    ConstitutionsEnum.SPORTY,
    ConstitutionsEnum.CURVY
  ];
}

export class CreateAdvDTO implements IAdvFields {
  @IsOptional()
  @IsString({
    message: 'Text of ad should be a string'
  })
  text?: string = "";

  @IsOptional()
  @IsArray()
  photos?: number[] = [];

  @IsOptional()
  @IsEnum(AdTypesEnum)
  type: AdTypesEnum;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdTargetFiltersDTO)
  targetFilters: AdTargetFiltersDTO;

  @IsObject()
  location: { type: 'Point'; coordinates: [ number, number ] };

  @IsOptional()
  @IsEnum(OpenersEnum)
  opener?: OpenersEnum = OpenersEnum.QUESTION;

  @IsOptional()
  @IsString()
  song?: string = "";

  @IsOptional()
  @IsObject()
  travelsTo?: { type: 'Point'; coordinates: [number, number] };

  @IsOptional()
  @IsString()
  travelDateFrom?: string;

  @IsOptional()
  @IsString()
  travelDateTo?: string;
};
/**
 * Here the duplicated part comes TODO
 */
export class EditAdTargetFiltersDTO {
  @IsOptional()
  @IsEnum(GendersEnum, {
    message: 'Gender does not match any of existing',
    each: true
  })
  gender?: GendersEnum[];

  @IsOptional()
  @IsNumber()
  genderExpressionFrom?: number;

  @IsOptional()
  @IsNumber()
  genderExpressionTo?: number;

  @IsOptional()
  @IsNumber()
  orientationFrom?: number;

  @IsOptional()
  @IsNumber()
  orientationTo?: number;

  @IsOptional()
  @IsNumber()
  distance?: number;

  @IsOptional()
  @IsNumber()
  ageFrom?: number;

  @IsOptional()
  @IsNumber()
  ageTo?: number;

  @IsOptional()
  @IsNumber()
  heightFrom?: number;

  @IsOptional()
  @IsNumber()
  heightTo?: number;

  @IsOptional()
  @IsEnum(ConstitutionsEnum, {
    message: 'Constitutions does not match any of existing',
    each: true
  })
  constitution?: ConstitutionsEnum[];
}

export class EditAdvDTO implements Partial<IAdvFields> {
  @IsOptional()
  @IsString({
    message: 'Text of ad should be a string'
  })
  text?: string;

  @IsOptional()
  @IsArray()
  photos?: number[];

  @IsOptional()
  @ValidateNested()
  @Type(() => EditAdTargetFiltersDTO)
  targetFilters?: EditAdTargetFiltersDTO;

  @IsOptional()
  @IsObject()
  location?: { type: 'Point'; coordinates: [number, number] };

  @IsOptional()
  @IsEnum(OpenersEnum)
  opener?: OpenersEnum;

  @IsOptional()
  @IsString()
  song?: string;

  @IsOptional()
  @IsObject()
  travelsTo?: { type: 'Point'; coordinates: [number, number] };

  @IsOptional()
  @IsString()
  travelDateFrom?: string;

  @IsOptional()
  @IsString()
  travelDateTo?: string;
};
