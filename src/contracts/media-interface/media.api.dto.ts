import { IDeleteMedia, IEditMediaAccess, IGetMedia, ISetMediaPrivacy, IUploadMedia } from './media.api-interface';
import { IsBoolean, IsNumber, IsOptional, Validate } from 'class-validator';
import { Transform, Type } from 'class-transformer';

class IsMulterFile {
  validate(file: Express.Multer.File | undefined): boolean {
    return file !== undefined && typeof file === 'object' && 'buffer' in file && 'originalname' in file;
  }

  defaultMessage(): string {
    return 'Invalid file format or file is missing';
  }
};

export class UploadMediaDto implements IUploadMedia.Request {
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  expiration?: number;

  @Validate(IsMulterFile, {
    message: 'Uploaded file must be a valid Multer file object',
  })
  file: Express.Multer.File;
};

export class GetMediaDto implements Partial<IGetMedia.Request> {
  @Type(() => Number)
  @IsNumber()
  mediaId: number;
};

export class DeleteMediaDto implements Partial<IDeleteMedia.Request> {
  @Type(() => Number)
  @IsNumber()
  mediaId: number;
};

export class SetMediaPrivacyDto implements Partial<ISetMediaPrivacy.Request> {
  @Type(() => Number)
  @IsNumber()
  mediaId: number;
};

export class EditMediaAccessDto implements Partial<IEditMediaAccess.Request> {
  @Type(() => Number)
  @IsNumber()
  accessorId: number;

  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  giver: boolean;
};
