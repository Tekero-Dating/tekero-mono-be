import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ConstitutionsEnum, GendersEnum } from '../db/models/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDTO {
  @ApiProperty()
  @IsOptional()
  home_location?: string;

  @ApiProperty()
  @IsOptional()
  location?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber({ allowNaN: false }, {
    message: 'Orientation should be a number from 1 to 100'
  })
  orientation?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber({ allowNaN: false }, {
    message: 'Height should be a number'
  })
  height?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber({ allowNaN: false }, {
    message: 'Weight should be a number'
  })
  weight?: number;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ConstitutionsEnum, {
    message: `Selected composition type doesn't match any of existing`
  })
  constitution?: ConstitutionsEnum;

  @ApiProperty()
  @IsOptional()
  @IsEnum(GendersEnum, {
    message: `Selected gender doesn't match any of existing`
  })
  sex?: GendersEnum;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  dob?: Date;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  profile_picture?: number;

  @ApiProperty()
  @IsOptional()
  playlist?: string;

  @ApiProperty()
  @IsOptional()
  @IsString({
    message: 'Incorrect type of biography'
  })
  bio?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber({ allowNaN: false }, {
    message: 'Gender expression should be a number from 1 to 100'
  })
  gender_expression?: number;
};
