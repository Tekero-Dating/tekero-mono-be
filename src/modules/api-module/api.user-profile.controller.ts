import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Res, UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { rmqSend } from '../../utils/rmq-utils.nest';
import { UpdateProfileDTO } from '../../contracts/api-interface/api.dto';
import { USER_PROFILES_SERVICE_NAME } from '../../contracts/uesr-profiles-interface/user-profiles.constants';
import { USER_PROFILES_MSG_PATTERNS } from '../../contracts/uesr-profiles-interface/user-profiles.api-interface';
import { TekeroError } from '../../utils/error-handling-utils';
import { JwtAuthGuard } from '../auth-module/jwt.auth-guard';

@Controller('api/user-profile')
export class ApiUserProfileController {
  constructor(
    @Inject(USER_PROFILES_SERVICE_NAME)
    private readonly client: ClientProxy
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }
  async onApplicationShutdown(signal?: string) {
    await this.client.close();
  }

  @UseGuards(JwtAuthGuard)
  @Get('get/:userId')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async getUserProfile(
    @Param('userId') userId: number,
    @Res() res
  ) {
    await rmqSend(
      this.client,
      USER_PROFILES_MSG_PATTERNS.GET,
      userId,
      ({ success, result, error }) => {
        if (success) {
          return res.status(200).send({ success, result });
        } else {
          const { status, message } = TekeroError(error);
          return res.status(status).send({ success, error: { status, message } });
        }
      }
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('update/:userId')
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  async updateUserProfile(@Body() payload: UpdateProfileDTO, @Param('userId') userId: number, @Res() res) {
    if (!Object.keys(payload).length) {
      const { status, message } = TekeroError(new BadRequestException('There are nothing to update'));
      return res.status(status).send({ success: false, error: { status, message } });
    }

    await rmqSend(
      this.client,
      USER_PROFILES_MSG_PATTERNS.UPDATE,
      { ...payload, userId },
      ({ success, result, error }) => {
        if (success) {
          return res.status(200).send({ success, result });
        } else {
          const { status, message } = TekeroError(error);
          return res.status(status).send({ success, error: { status, message } });
        }
      }
    );
  }
}
