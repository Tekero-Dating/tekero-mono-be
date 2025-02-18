import {
  Controller, Delete,
  Get,
  Inject,
  Logger,
  Param, Patch,
  Post,
  Query, Request,
  Res,
  UploadedFile, UseGuards,
  UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TekeroError } from '../../utils/error-handling-utils';
import { rmqSend } from '../../utils/rmq-utils.nest';
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
import { JwtAuthGuard } from '../../utils/jwt.auth-guard';
import { JwtReq } from '../../utils/auth.jwt.strategy';

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

  @UseGuards(JwtAuthGuard)
  @Post('upload-media')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: JwtReq,
    @Res() res,
    @Query('expiration') expiration?: number
  ): Promise<IUploadMedia.Response> {
    const { userId } = req.user;
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
      return res.status(status).send({ success: false, error: { status, message } });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-media/:mediaId')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async getMediaById(
    @Param() params: GetMediaDto,
    @Request() req: JwtReq,
    @Res() res,
  ) {
    const { userId } = req.user;
    const { mediaId } = params;
    this.logger.log('getMediaById', { mediaId, userId });
    await rmqSend<IGetMedia.Request, IGetMedia.Response>(
      this.client,
      MEDIA_MSG_PATTERNS.GET_MEDIA,
      { userId, mediaId },
      ({ success, result, error }) => {
        if (success) {
          return res.status(200).send({ success, result });
        } else {
          const { status, message } = TekeroError(error);
          this.logger.error({ error });
          return res.status(status).send({ success: false, error: { status, message } });
        }
      }
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-media/:mediaId')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async deleteMediaById(
    @Param() params: DeleteMediaDto,
    @Request() req: JwtReq,
    @Res() res,
  ) {
    const { userId } = req.user;
    const { mediaId } = params;
    this.logger.log('deleteMediaById', { mediaId, userId });
    await rmqSend<IGetMedia.Request, IGetMedia.Response>(
      this.client,
      MEDIA_MSG_PATTERNS.DELETE_MEDIA,
      { userId, mediaId },
      ({ success, result, error }) => {
        if (success) {
          return res.status(204).send({ success, result });
        } else {
          const { status, message } = TekeroError(error);
          this.logger.error({ status, message });
          res.status(status).send({ success: false, error: { message } });
        }
      }
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-privacy/:mediaId')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async updatePrivacy(
    @Param() params: SetMediaPrivacyDto,
    @Request() req: JwtReq,
    @Res() res,
  ) {
    const { userId } = req.user;
    const { mediaId } = params;
    this.logger.log('updatePrivacy', { mediaId, userId });
    await rmqSend<ISetMediaPrivacy.Request, ISetMediaPrivacy.Response>(
      this.client,
      MEDIA_MSG_PATTERNS.SET_MEDIA_PRIVACY,
      { userId, mediaId },
      ({ success, result, error }) => {
        if (success) {
          return res.status(202).send({ success, result });
        } else {
          const { status, message } = TekeroError(error);
          this.logger.error({ status, message });
          res.status(status).send({ success, error: { message } });
        }
      }
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-media-access/:accessorId/:giver')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async updateMediaAccess(
    @Param() params: EditMediaAccessDto,
    @Request() req: JwtReq,
    @Res() res,
  ) {
    const { userId: ownerId } = req.user;
    const { accessorId, giver } = params;
    this.logger.log('updateMediaAccess', { ownerId, accessorId, giver });
    await rmqSend<IEditMediaAccess.Request, IEditMediaAccess.Response>(
      this.client,
      MEDIA_MSG_PATTERNS.EDIT_MEDIA_ACCESS,
      { ownerId, accessorId, giver },
      ({ success, result, error }) => {
        if (success) {
          return res.status(202).send({ success, result });
        } else {
          const { status, message } = TekeroError(error);
          this.logger.error({ status, message });
          res.status(status).send({ success, error: { message } });
        }
      }
    );
  }
}
