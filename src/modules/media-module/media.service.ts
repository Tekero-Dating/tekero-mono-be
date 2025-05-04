import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
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
import { MediaTypesEnum } from '../../contracts/db/models/enums';
import { ChatUser } from '../../contracts/db/models/chat-user.entity';
import { Message } from '../../contracts/db/models/message.entity';

@Injectable()
export class MediaService implements IMediaService {
  AWS_S3_BUCKET = AWS_S3_BUCKET;
  s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  });
  logger = new Logger(MediaService.name);

  constructor(
    @Inject(MODELS_REPOSITORIES_ENUM.MEDIA)
    private readonly mediaRepository: typeof Media,
    @Inject(MODELS_REPOSITORIES_ENUM.MEDIA_ACCESS)
    private readonly mediaAccessRepository: typeof MediaAccess,
    @Inject(MODELS_REPOSITORIES_ENUM.USER)
    private readonly userRepository: typeof User,
    @Inject(MODELS_REPOSITORIES_ENUM.CHAT_USER)
    private readonly chatUserRepository: typeof ChatUser,
    @Inject(MODELS_REPOSITORIES_ENUM.MESSAGE)
    private readonly messageRepository: typeof Message,
    @Inject(S3Service)
    private readonly s3Service: S3Service,
  ) {}

  async uploadMedia(payload) {
    const { userId, expiration, file } = payload;
    const { originalname: name } = file;
    const context = { userId, name };
    this.logger.log('uploadMedia', context);

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
    const context = { userId, mediaId };
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
    });
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // check user access to the private photo
    if (media.private) {
      this.logger.log('getMedia private', context);
      const mediaOwner = await this.mediaRepository.findOne({
        where: { id: mediaId },
      });

      const mediaAccess = await this.mediaAccessRepository.findOne({
        where: {
          accessor_id: userId,
          owner_id: mediaOwner?.user_id,
        },
      });
      if (!mediaAccess) {
        this.logger.log('getMedia private: no access', context);
        throw new NotAcceptableException(
          'Current user can not access private media',
        );
      }
    }

    // check user access to chat
    if (
      media.media_type === MediaTypesEnum.MESSAGE_IMAGE ||
      media.media_type === MediaTypesEnum.MESSAGE_AUDIO ||
      media.media_type === MediaTypesEnum.MESSAGE_VIDEO
    ) {
      this.logger.log('getMedia: chat media', context);
      const message = await this.messageRepository.findOne({
        where: { media_id: mediaId },
      });
      if (!message) {
        this.logger.error(
          'getMedia: chat media, message does not exist',
          context,
        );
        throw new NotFoundException('Message not found for this media');
      }
      const chatUser = await this.chatUserRepository.findOne({
        where: {
          chat_id: message.chat_id,
          user_id: userId,
        },
      });
      if (!chatUser) {
        this.logger.error(
          'getMedia: user does not have access to chat',
          context,
        );
        throw new NotAcceptableException(
          'User has no access to this chat media',
        );
      }
    }

    try {
      const key = media.url.split('.com/')[1];
      const url = await this.s3Service.getPresignedUrl(key);
      if (!url) {
        this.logger.error('getMedia: can not find media content in S3');
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
