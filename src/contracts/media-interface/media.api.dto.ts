import {
  IDeleteMedia,
  IEditMediaAccess,
  IGetMedia,
  ISetMediaPrivacy,
  IUploadMedia,
} from './media.api-interface';
import { IsBoolean, IsNumber, IsOptional, Validate } from 'class-validator';
import { Transform, Type } from 'class-transformer';
// @ts-ignore because Multer can't be used as a type since it's not exported from the express namespace
import { Multer } from 'multer';
import { ApiProperty } from '@nestjs/swagger';

class IsMulterFile {
  validate(file: Express.Multer.File | undefined): boolean {
    return (
      file !== undefined &&
      typeof file === 'object' &&
      'buffer' in file &&
      'originalname' in file
    );
  }

  defaultMessage(): string {
    return 'Invalid file format or file is missing';
  }
}

export class UploadMediaDto implements IUploadMedia.Request {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  userId: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  expiration?: number;

  @ApiProperty()
  @Validate(IsMulterFile, {
    message: 'Uploaded file must be a valid Multer file object',
  })
  file: Express.Multer.File;
}

export class GetMediaDto implements Partial<IGetMedia.Request> {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  mediaId: number;
}

export class DeleteMediaDto implements Partial<IDeleteMedia.Request> {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  mediaId: number;
}

export class SetMediaPrivacyDto implements Partial<ISetMediaPrivacy.Request> {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  mediaId: number;
}

export class EditMediaAccessDto implements Partial<IEditMediaAccess.Request> {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  accessorId: string;

  @ApiProperty()
  @Transform(({ value }: { value: any }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  giver: boolean;
}
