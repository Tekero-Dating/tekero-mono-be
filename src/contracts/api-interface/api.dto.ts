import {
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ConstitutionsEnum, GendersEnum, OpenersEnum } from '../db/models/enums';
import { AdTypesEnum } from '../db/models/enums/ad-types.enum';
import { Type } from 'class-transformer';
import { IAdvFields } from '../ads-interface/ads.api-interface';

export class AdFiltersDTO {
  @IsOptional()
  @IsEnum(GendersEnum, {
    message: 'Gender does not match any of existing',
    each: true
  })
  gender?: GendersEnum[];

  @IsOptional()
  @IsNumber()
  sexualityFrom?: number;

  @IsOptional()
  @IsNumber()
  sexualityTo?: number;

  @IsOptional()
  @IsNumber()
  orientationFrom?: number;

  @IsOptional()
  @IsNumber()
  orientationTo?: number;

  @IsOptional()
  @IsNumber()
  location?: number;

  @IsOptional()
  @IsNumber()
  ageFrom?: number;

  @IsOptional()
  @IsNumber()
  ageTo?: number;

  @IsOptional()
  @IsEnum(ConstitutionsEnum, {
    message: 'Constitutions does not match any of existing',
    each: true
  })
  constitution?: ConstitutionsEnum[];
}

export class UpdateProfileDTO {
  @IsOptional()
  @IsNumber({ allowNaN: false }, {
    message: 'Height should be a number'
  })
  height?: number;

  @IsOptional()
  @IsNumber({ allowNaN: false }, {
    message: 'Weight should be a number'
  })
  weight?: number;

  @IsOptional()
  @IsEnum(ConstitutionsEnum, {
    message: `Selected composition type doesn't match any of existing`
  })
  constitution?: ConstitutionsEnum;

  @IsOptional()
  @IsEnum(GendersEnum, {
    message: `Selected gender doesn't match any of existing`
  })
  gender?: GendersEnum;

  @IsOptional()
  @IsString({
    message: 'Incorrect type of biography'
  })
  bio?: string;

  @IsOptional()
  @IsNumber({ allowNaN: false }, {
    message: 'Profile picture Id should be a number'
  })
  profilePicture?: number;

  @IsOptional()
  @IsString({
    message: 'Incorrect type of name. String expected'
  })
  firstName?: string;

  @IsOptional()
  @IsString({
    message: 'Incorrect type of last name. String expected'
  })
  lastName?: string;

  @IsOptional()
  @IsDate({
    message: 'Incorrect type of birth date. Date expected'
  })
  dob?: Date;

  @IsOptional()
  @IsString({
    message: 'Incorrect type of home location. String expected'
  })
  homeLocation?: string;

  @IsOptional()
  @IsNumber({ allowNaN: false }, {
    message: 'Orientation should be a number from 1 to 100'
  })
  orientation?: number;

  @IsOptional()
  @IsNumber({ allowNaN: false }, {
    message: 'Sexuality should be a number from 1 to 100'
  })
  sexuality?: number;

  @IsOptional()
  @IsString({
    message: 'Incorrect type of playlist. Url string expected'
  })
  playlist?: string;
};

export class CreateAdvDTO implements IAdvFields {
  @IsOptional()
  @IsString({
    message: 'Text of ad should be a string'
  })
  text?: string;

  @IsOptional()
  @IsArray()
  photos?: number[];

  @IsOptional()
  @IsEnum(AdTypesEnum)
  type: AdTypesEnum;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdFiltersDTO)
  filter?: AdFiltersDTO;

  @IsOptional()
  @IsEnum(OpenersEnum)
  opener?: OpenersEnum;

  @IsOptional()
  @IsString()
  openerQuestion?: string;

  @IsOptional()
  @IsString()
  song?: string;
};
