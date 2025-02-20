import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import {
  AWS_ACCESS_KEY,
  AWS_REGION,
  AWS_S3_BUCKET,
  AWS_SECRET_KEY,
} from '../../config/config';
import {
  IEditMediaAccess,
  IMediaService,
  ISetMediaPrivacy,
} from '../../contracts/media-interface/media.api-interface';
import { MODELS_REPOSITORIES_ENUM } from '../../contracts/db/models/models.enum';
import { Media } from '../../contracts/db/models/mdeia.entity';
import { User } from '../../contracts/db/models/user.entity';
import { S3Service } from './s3.service';
import { MediaAccess } from '../../contracts/db/models/mdeia-access.entity';

@Injectable()
export class MediaService implements IMediaService {
  AWS_S3_BUCKET = AWS_S3_BUCKET;
  s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  });

  constructor(
    @Inject(MODELS_REPOSITORIES_ENUM.MEDIA)
    private readonly mediaRepository: typeof Media,
    @Inject(MODELS_REPOSITORIES_ENUM.MEDIA_ACCESS)
    private readonly mediaAccessRepository: typeof MediaAccess,
    @Inject(MODELS_REPOSITORIES_ENUM.USER)
    private readonly userRepository: typeof User,
    @Inject(S3Service)
    private readonly s3Service: S3Service,
  ) {}

  async uploadMedia(payload) {
    const { userId, expiration, file } = payload;
    const { originalname: name } = file;

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const uploadedFileUrl = await this.s3_upload(
        file.buffer,
        this.AWS_S3_BUCKET,
        name,
        file.mimetype,
      );
      if (uploadedFileUrl) {
        const newMedia = await this.mediaRepository.create<Media>({
          user_id: userId,
          private: false,
          url: uploadedFileUrl,
          ...(expiration
            ? {
                expiration,
                opened: false,
              }
            : {}),
        });
        return newMedia.id;
      } else {
        throw new InternalServerErrorException('Can not upload media');
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async getMedia(userId: number, mediaId: number): Promise<{ url: string }> {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
    });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    try {
      const key = media.url.split('.com/')[1];
      const url = await this.s3Service.getPresignedUrl(key);
      if (!url) {
        throw new NotFoundException('Media content not found');
      }
      return { url };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching media');
    }
  }

  async deleteMedia(userId: number, mediaId: number): Promise<void> {
    const media = await this.mediaRepository.findOne({
      where: {
        user_id: userId,
        id: mediaId,
      },
    });
    if (!media) {
      throw new NotFoundException('Media to delete does not exist');
    }
    const key = media.url.split('.com/')[1];
    const deleted = await this.s3_delete(key);
    if (deleted) {
      deleted &&
        (await this.mediaRepository.destroy({
          where: {
            id: mediaId,
          },
        }));
      return;
    } else {
      throw new InternalServerErrorException("Can't delete media");
    }
  }

  async setMediaPrivacy(
    userId: number,
    mediaId: number,
  ): Promise<ISetMediaPrivacy.Response['result']> {
    const media = await this.mediaRepository.findOne({
      where: { user_id: userId, id: mediaId },
    });
    if (!media) {
      throw new NotFoundException('Media does not exist');
    }

    const updated = await this.mediaRepository.update(
      { private: !media.private },
      { where: { id: media.id } },
    );

    if (updated[0]) {
      return { private: !media.private };
    } else {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async editMediaAccess(
    ownerId,
    accessorId,
    giver,
  ): Promise<IEditMediaAccess.Response['result']> {
    if (giver) {
      const result = await this.mediaAccessRepository.findOrCreate<MediaAccess>(
        {
          where: {
            owner_id: ownerId,
            accessor_id: accessorId,
          },
        },
      );
      if (result) {
        return {
          allowed: true,
        };
      } else {
        throw new InternalServerErrorException('Something went wrong');
      }
    } else {
      const result = await this.mediaAccessRepository.destroy<MediaAccess>({
        where: {
          owner_id: ownerId,
          accessor_id: accessorId,
        },
      });
      if (result) {
        return {
          allowed: false,
        };
      } else {
        throw new InternalServerErrorException('Something went wrong');
      }
    }
  }

  private async s3_delete(key) {
    const params = {
      Bucket: AWS_S3_BUCKET!,
      Key: key,
    };

    try {
      const s3Response = await this.s3.deleteObject(params).promise();
      return s3Response.DeleteMarker;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  private async s3_upload(file, bucket, name, mimetype) {
    const params = {
      Bucket: bucket,
      Key: String(`${uuidv4()}_${name}`),
      Body: file,
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: AWS_REGION,
      },
    };

    try {
      const s3Response = await this.s3.upload(params).promise();
      return s3Response.Location;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
