import {
  Body,
  Controller, Delete,
  Get,
  Inject,
  Logger,
  Param, Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { QUESTIONNAIRE_SERVICE_NAME } from '../../contracts/questionnaire-interface/questionnaire.constants';
import { ClientProxy } from '@nestjs/microservices';
import { TekeroError } from '../../utils/error-handling-utils';
import { rmqSend } from '../../utils/rmq-utils.nest';
import {
  IGetQuestionnaire, ISubmitQuestionByShortcode,
  QUESTIONNAIRE_MSG_PATTERNS,
} from '../../contracts/questionnaire-interface/questionnaire.api-interface';
import { MediaService } from '../media-module/media.service';
import {
  IEditMediaAccess,
  IGetMedia,
  ISetMediaPrivacy,
  IUploadMedia,
} from '../../contracts/media-interface/media.api-interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { MEDIA_MSG_PATTERNS, MEDIA_SERVICE_NAME } from '../../contracts/media-interface/media.constants';
import {
  DeleteMediaDto,
  EditMediaAccessDto,
  GetMediaDto,
  SetMediaPrivacyDto,
} from '../../contracts/media-interface/media.api.dto';

@Controller('api/media')
export class ApiMediaController {
  private readonly logger = new Logger(ApiMediaController.name);
  constructor(
    @Inject(MEDIA_SERVICE_NAME) private client: ClientProxy,
    private readonly mediaService: MediaService
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  async onApplicationShutdown(signal?: string) {
    await this.client.close();
  }

  @Post('upload-media/:userId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @Param('userId') userId: number,
    @UploadedFile() file: Express.Multer.File,
    @Res() res,
    @Query('expiration') expiration?: number
  ): Promise<IUploadMedia.Response> {
    this.logger.log(`API request uploadImage`);
    try {
      const result = await this.mediaService.uploadMedia({
        userId, expiration, file
      });

      this.logger.log(`uploadImage: successfully uploaded image`);
      return res.status(201).send({
        success: true,
        result: {
          mediaId: result
        }
      });
    } catch (error) {
      const { status, message } = TekeroError(error);
      this.logger.error({ status, message });
      return res.status(status).send(message);
    }
  }

  @Get('get-media/:userId/:mediaId')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async getMediaById(
    @Param() params: GetMediaDto,
    @Res() res,
  ) {
    const { mediaId, userId } = params;
    this.logger.log('getMediaById', { mediaId, userId });
    rmqSend<IGetMedia.Request, IGetMedia.Response>(
      this.client,
      MEDIA_MSG_PATTERNS.GET_MEDIA,
      { userId, mediaId },
      ({ success, result, error }) => {
        if (success) {
          res.status(200).send(result);
        } else {
          const { status, message } = TekeroError(error);
          this.logger.error({ status, message });
          res.status(status).send(message);
        }
      }
    );
  }

  @Delete('delete-media/:userId/:mediaId')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async deleteMediaById(
    @Param() params: DeleteMediaDto,
    @Res() res,
  ) {
    const { mediaId, userId } = params;
    this.logger.log('deleteMediaById', { mediaId, userId });
    rmqSend<IGetMedia.Request, IGetMedia.Response>(
      this.client,
      MEDIA_MSG_PATTERNS.DELETE_MEDIA,
      { userId, mediaId },
      ({ success, result, error }) => {
        if (success) {
          res.status(204).send(result);
        } else {
          const { status, message } = TekeroError(error);
          this.logger.error({ status, message });
          res.status(status).send(message);
        }
      }
    );
  }

  @Patch('update-privacy/:userId/:mediaId')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async updatePrivacy(
    @Param() params: SetMediaPrivacyDto,
    @Res() res,
  ) {
    const { mediaId, userId } = params;
    this.logger.log('updatePrivacy', { mediaId, userId });
    rmqSend<ISetMediaPrivacy.Request, ISetMediaPrivacy.Response>(
      this.client,
      MEDIA_MSG_PATTERNS.SET_MEDIA_PRIVACY,
      { userId, mediaId },
      ({ success, result, error }) => {
        if (success) {
          res.status(202).send(result);
        } else {
          const { status, message } = TekeroError(error);
          this.logger.error({ status, message });
          res.status(status).send(message);
        }
      }
    );
  }

  @Patch('update-media-access/:ownerId/:accessorId/:giver')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async updateMediaAccess(
    @Param() params: EditMediaAccessDto,
    @Res() res,
  ) {
    const { ownerId, accessorId, giver } = params;
    this.logger.log('updateMediaAccess', { ownerId, accessorId, giver });
    rmqSend<IEditMediaAccess.Request, IEditMediaAccess.Response>(
      this.client,
      MEDIA_MSG_PATTERNS.EDIT_MEDIA_ACCESS,
      { ownerId, accessorId, giver },
      ({ success, result, error }) => {
        if (success) {
          res.status(202).send(result);
        } else {
          const { status, message } = TekeroError(error);
          this.logger.error({ status, message });
          res.status(status).send(message);
        }
      }
    );
  }
}
