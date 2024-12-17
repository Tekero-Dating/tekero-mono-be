import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '../../contracts/db/models/user.entity';
import { MODELS_REPOSITORIES_ENUM } from '../../contracts/db/models/models.enum';
import { hashPassword } from '../../utils/hash-password';
import { JwtService } from '@nestjs/jwt';
import { JWT_REFRESH_TOKEN_TTL } from '../../config/config';
import { Session } from '../../contracts/db/models/sessions.entity';
import { Request } from 'express';
import { extractUserFingerprint } from '../../utils/extract-metadata-from-request';
import { SessionStatesEnum } from '../../contracts/db/models/enums/session-states.enum';
import { Op } from 'sequelize';

@Injectable()
export class AuthService {
  constructor (
    @Inject(MODELS_REPOSITORIES_ENUM.USER)
    private userRepository: typeof User,
    @Inject(MODELS_REPOSITORIES_ENUM.SESSIONS)
    private sessionsRepository: typeof Session,
    private jwtService: JwtService
  ) {}

  async validateUserCredentials(email: string, password: string):
    Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOne<User>({
      where: { email }
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const hashedPassword = await hashPassword(password);
    if (user.password === hashedPassword) {
      const { password, ...result } = user.dataValues;
      return result;
    }
    return null;
  }

  login(user: Omit<User, 'password'>): {
    access_token: string,
    refresh_token: string
  } {
    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: JWT_REFRESH_TOKEN_TTL
      })
    }
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const access_token = this.jwtService.sign({
        email: payload.email, sub: payload.id
      });

      const updated =  await this.sessionsRepository.update<Session>(
        { access_token },
        {
          where: {
            user_id: payload.sub,
            session_state: SessionStatesEnum.ACTIVE,
            refresh_token: refreshToken,
            rt_expiration_date: {
              [Op.gt]: new Date()
            }
          },
          returning: true
        }
      );

      if (updated[0] < 1) {
        throw new UnauthorizedException('Refresh token does not work');
      }
      return access_token;
    } catch (e) {
      throw new Error('Invalid refresh token');
    }
  }

  async openUserSession(
    { access_token, refresh_token, req, user }:
      { access_token: string; refresh_token: string; req: Request, user: Omit<User, 'password'> }
  ) {
    const userData = this.jwtService.decode(access_token);
    const refreshExpire = new Date(+`${this.jwtService.decode(refresh_token).exp}000`);
    const accessExpire = new Date(+`${this.jwtService.decode(access_token).exp}000`);
    const fingerPrint = extractUserFingerprint(req);

    await this.sessionsRepository.update<Session>(
      { session_state: SessionStatesEnum.OUTDATED },
      {
        where: { user_id: userData.sub, session_state: SessionStatesEnum.ACTIVE }
      }
    );
    await this.sessionsRepository.create<Session>({
      access_token,
      refresh_token,
      rt_expiration_date: refreshExpire,
      at_expiration_date: accessExpire,
      fingerprint: fingerPrint,
      session_state: SessionStatesEnum.ACTIVE,
      user_id: user.id
    });
  }
}
