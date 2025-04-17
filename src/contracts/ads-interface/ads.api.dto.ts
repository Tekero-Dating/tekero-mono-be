import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  ConstitutionsEnum,
  GendersEnum,
  OpenersEnum,
} from '../db/models/enums';
import { IAdvFields } from './ads.api-interface';
import { AdTypesEnum } from '../db/models/enums/ad-types.enum';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * I fucked up with the default values for ads. The problem comes
 * when user try to update some fields. In that case we need t extend
 * createAdvDTO and make all optional but during the update of single field
 * it gives the default values for all the other fields. Because of it here
 * we have tons of duplicated code. TODO
 */

/**
 * TODO: another shit - class-validator sucks and eat shit!
 * it doesn't validate nested objects
 * (https://github.com/typestack/class-validator/issues/1375) -
 * contributors just saying that it's not hight ptiority
 * and they won't fix it.
 *
 * Why did I used these fucking DTOs then????
 */
export class CoordinatesDTO {
  @ApiProperty({ enum: ['Point'], example: 'Point' })
  @IsString()
  type: 'Point';

  @ApiProperty({ type: [Number], example: [40.7128, -74.006] })
  @IsArray()
  @IsNumber({}, { each: true })
  coordinates: [number, number];
}

export class AdTargetFiltersDTO {
  @ApiProperty()
  @IsOptional()
  @IsEnum(GendersEnum, {
    message: 'Gender does not match any of existing',
    each: true,
  })
  gender?: GendersEnum[] = [
    GendersEnum.FEMALE,
    GendersEnum.MALE,
    GendersEnum.NON_BINARY,
    GendersEnum.TRANS_FEMALE,
    GendersEnum.TRANS_MALE,
  ];

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  genderExpressionFrom?: number = 0;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  genderExpressionTo?: number = 100;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  orientationFrom?: number = 0;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  orientationTo?: number = 100;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  distance?: number = 100;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  ageFrom?: number = 18;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  ageTo?: number = 118;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  heightFrom?: number = 100;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  heightTo?: number = 250;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ConstitutionsEnum, {
    message: 'Constitutions does not match any of existing',
    each: true,
  })
  constitution?: ConstitutionsEnum[] = [
    ConstitutionsEnum.SKINNY,
    ConstitutionsEnum.AVERAGE,
    ConstitutionsEnum.SPORTY,
    ConstitutionsEnum.CURVY,
  ];
}

export class CreateAdvDTO implements IAdvFields {
  @ApiProperty()
  @IsOptional()
  @IsString({
    message: 'Text of ad should be a string',
  })
  text?: string = '';

  @ApiProperty()
  @IsOptional()
  @IsArray()
  photos?: number[] = [];

  @ApiProperty()
  @IsOptional()
  @IsEnum(AdTypesEnum)
  type: AdTypesEnum;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => AdTargetFiltersDTO)
  targetFilters: AdTargetFiltersDTO;

  @ApiProperty({ type: () => CoordinatesDTO })
  @ValidateNested()
  @Type(() => CoordinatesDTO)
  location: CoordinatesDTO;

  @ApiProperty()
  @IsOptional()
  @IsEnum(OpenersEnum)
  opener?: OpenersEnum = OpenersEnum.QUESTION;

  @ApiProperty()
  @IsOptional()
  @IsString()
  song?: string = '';

  @ValidateNested()
  @Type(() => CoordinatesDTO)
  @ApiProperty({ type: CoordinatesDTO })
  travelsTo?: CoordinatesDTO;

  @ApiProperty()
  @IsOptional()
  @IsString()
  travelDateFrom?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  travelDateTo?: string;
}
/**
 * Here the duplicated part comes TODO
 */
export class EditAdTargetFiltersDTO {
  @ApiProperty()
  @IsOptional()
  @IsEnum(GendersEnum, {
    message: 'Gender does not match any of existing',
    each: true,
  })
  gender?: GendersEnum[];

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  genderExpressionFrom?: number;

  @IsOptional()
  @IsNumber()
  genderExpressionTo?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  orientationFrom?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  orientationTo?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  distance?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  ageFrom?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  ageTo?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  heightFrom?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  heightTo?: number;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ConstitutionsEnum, {
    message: 'Constitutions does not match any of existing',
    each: true,
  })
  constitution?: ConstitutionsEnum[];
}

export class EditAdvDTO implements Partial<IAdvFields> {
  @ApiProperty()
  @IsOptional()
  @IsString({
    message: 'Text of ad should be a string',
  })
  text?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  photos?: number[];

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => EditAdTargetFiltersDTO)
  targetFilters?: EditAdTargetFiltersDTO;

  @ValidateNested()
  @Type(() => CoordinatesDTO)
  @ApiProperty({ type: CoordinatesDTO })
  location: CoordinatesDTO;

  @ApiProperty()
  @IsOptional()
  @IsEnum(OpenersEnum)
  opener?: OpenersEnum;

  @ApiProperty()
  @IsOptional()
  @IsString()
  song?: string;

  @ValidateNested()
  @Type(() => CoordinatesDTO)
  @ApiProperty({ type: CoordinatesDTO })
  travelsTo?: CoordinatesDTO;

  @ApiProperty()
  @IsOptional()
  @IsString()
  travelDateFrom?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  travelDateTo?: string;
}

export class SuitableAdvDTO {
  @ApiProperty()
  @ValidateNested()
  @Type(() => AdTargetFiltersDTO)
  filters: AdTargetFiltersDTO;

  @ApiProperty({ type: () => CoordinatesDTO })
  @Type(() => CoordinatesDTO)
  @ValidateNested()
  location: CoordinatesDTO;
}
