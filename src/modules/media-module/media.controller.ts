import {
  Controller, Inject, Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import {
  IDeleteMedia, IEditMediaAccess,
  IGetMedia,
  IMediaController,
  ISetMediaPrivacy,
} from '../../contracts/media-interface/media.api-interface';
import { MEDIA_MSG_PATTERNS, MEDIA_SERVICE_NAME } from '../../contracts/media-interface/media.constants';
import { ClientProxy, Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller('media')
export class MediaController implements IMediaController {
  private readonly logger = new Logger(MediaController.name);
  constructor(
    @Inject(MEDIA_SERVICE_NAME) private client: ClientProxy,
    private readonly mediaService: MediaService
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  @MessagePattern(MEDIA_MSG_PATTERNS.GET_MEDIA)
  async getMedia (@Payload() payload: IGetMedia.Request, @Ctx() context: RmqContext): Promise<IGetMedia.Response> {
    this.logger.log('getMedia', { payload });
    try {
      const { userId, mediaId } = payload;
      const result = await this.mediaService.getMedia(+userId, +mediaId);
      return {
        success: true,
        result
      }
    } catch (error) {
      return {
        success: false,
        error
      }
    }
    return {
      success: true
    }
  }

  @MessagePattern(MEDIA_MSG_PATTERNS.DELETE_MEDIA)
  async deleteMedia (@Payload() payload: IDeleteMedia.Request, @Ctx() context: RmqContext): Promise<IDeleteMedia.Response> {
    this.logger.log('deleteMedia', { payload });
    try {
      const { userId, mediaId } = payload;
      await this.mediaService.deleteMedia(userId, mediaId);
      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error
      }
    }
  }

  @MessagePattern(MEDIA_MSG_PATTERNS.SET_MEDIA_PRIVACY)
  async setMediaPrivacy (@Payload() payload: ISetMediaPrivacy.Request, @Ctx() context: RmqContext): Promise<ISetMediaPrivacy.Response> {
    this.logger.log('setMediaPrivacy', { payload });
    try {
      const { userId, mediaId } = payload;
      const result = await this.mediaService.setMediaPrivacy(userId, mediaId);
      return {
        success: true,
        result
      }
    } catch (error) {
      return {
        success: false,
        error
      }
    }
  }

  @MessagePattern(MEDIA_MSG_PATTERNS.EDIT_MEDIA_ACCESS)
  async editMediaAccess (@Payload() payload, @Ctx() context: RmqContext): Promise<IEditMediaAccess.Response> {
    this.logger.log('editMediaAccess', { payload });
    const { ownerId, accessorId, giver } = payload as IEditMediaAccess.Request;
    try {
      const result = await this.mediaService.editMediaAccess(ownerId, accessorId, giver);

      return {
        success: true,
        result
      };
    } catch (error) {
      return {
        success: false,
        error
      };
    }
  }
}
