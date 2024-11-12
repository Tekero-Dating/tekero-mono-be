import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ConstitutionsEnum, GendersEnum } from '../db/models/enums';

export class UpdateProfileDTO {
  @IsOptional()
  home_location?: string;

  @IsOptional()
  location?: string;

  @IsOptional()
  @IsNumber({ allowNaN: false }, {
    message: 'Orientation should be a number from 1 to 100'
  })
  orientation?: number;

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
  sex?: GendersEnum;

  @IsOptional()
  @IsDate()
  dob?: Date;

  @IsOptional()
  @IsNumber()
  profile_picture?: number;

  @IsOptional()
  playlist?: string;

  @IsOptional()
  @IsString({
    message: 'Incorrect type of biography'
  })
  bio?: string;

  @IsOptional()
  @IsNumber({ allowNaN: false }, {
    message: 'Gender expression should be a number from 1 to 100'
  })
  gender_expression?: number;
};
