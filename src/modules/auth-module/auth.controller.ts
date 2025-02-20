import {
  Controller,
  Post,
  UseGuards,
  Request,
  Res,
  Get,
  Body,
  Logger,
} from '@nestjs/common';
import { LocalAuthGuard } from './local.auth-guard';
import { AuthService } from './auth.service';
import { Request as Req, Response } from 'express';
import { durationToMilliseconds } from '../../utils/duration-converter';
import { JWT_REFRESH_TOKEN_TTL, JWT_TOKEN_TTL } from '../../config/config';
import { JwtAuthGuard } from '../../utils/jwt.auth-guard';
import { TekeroError } from '../../utils/error-handling-utils';
import { User } from '../../contracts/db/models/user.entity';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: Req & { user: User },
    @Res({ passthrough: true }) res: Response,
  ) {
    /**
     * Validation of the user credentials
     * is already done by AuthGuard
     */
    try {
      const tokens = this.authService.login(req.user);
      await this.authService.openUserSession({
        ...tokens,
        req,
        user: req.user,
      });
      res.cookie('access_token', tokens.access_token, {
        httpOnly: true,
        secure: false, // TODO: true
        sameSite: 'strict',
        maxAge: durationToMilliseconds(JWT_TOKEN_TTL!),
      });
      res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: false, // TODO: true
        sameSite: 'strict',
        maxAge: durationToMilliseconds(JWT_REFRESH_TOKEN_TTL!),
      });
      return res.send({
        success: true,
        result: {
          message: 'User logged in successfully',
        },
      });
    } catch (error) {
      const { status, message } = TekeroError(error);
      res.status(status).send({
        success: false,
        error: { status, message },
      });
    }
  }

  @Get('refresh')
  async refresh(
    @Body()
    { refresh_token }: { refresh_token: string },
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const accessToken = await this.authService.refresh(refresh_token);
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: false, // TODO: true
        sameSite: 'strict',
        maxAge: durationToMilliseconds(JWT_TOKEN_TTL!),
      });
      res.send({
        success: true,
      });
    } catch (error) {
      const { status, message } = TekeroError(error);
      res.status(status).send({
        success: false,
        error: { status, message },
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return req.logout();
  }
}
