import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET } from '../config/config';
import { areFingerprintsMatch } from './compare-fingerprints';
import { MODELS_REPOSITORIES_ENUM } from '../contracts/db/models/models.enum';
import { Session } from '../contracts/db/models/sessions.entity';
import { SessionStatesEnum } from '../contracts/db/models/enums/session-states.enum';
import { Request } from 'express';
import { extractUserFingerprint } from './extract-metadata-from-request';
import { Op } from 'sequelize';

export type JwtReq = Request & { user: { userId: number; email: string; } };

@Injectable()
export class AuthJwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(MODELS_REPOSITORIES_ENUM.SESSIONS)
    private sessionsRepository: typeof Session
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
      usernameField: 'email',
      passReqToCallback: true
    });
  }

  async validate(req: Request, payload) {
    console.log('validate');
    const userSession = await this.sessionsRepository.findOne({
      where: {
        user_id: payload.sub,
        session_state: SessionStatesEnum.ACTIVE,
        at_expiration_date: {
          [Op.gt]: new Date()
        }
      }
    });
    if (userSession) {
      const newFingerprint = extractUserFingerprint(req);
      const matchOfFingerprints = areFingerprintsMatch(userSession!.fingerprint, newFingerprint);
      console.log({ matchOfFingerprints })
      // if (!matchOfFingerprints) return null;
      return { userId: payload.sub, email: payload.email };
    }
    return null;
  }
}
