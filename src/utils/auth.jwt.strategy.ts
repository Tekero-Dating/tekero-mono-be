// src/auth/strategies/auth-jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-strategy';
import { Request } from 'express';
import fetch from 'node-fetch';
import { decode } from 'jsonwebtoken';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  // при необходимости можно добавить другие поля из пейлоада
}

export type JwtReq = Request & { user: { userId: string; email: string } };

@Injectable()
export class AuthJwtStrategy extends PassportStrategy(Strategy, 'authService') {
  constructor() {
    super();
  }

  override validate(
    ...args
  ): Promise<false | unknown | null> | false | unknown | null {
    console.log({ args: args });
    return args;
  }

  override async authenticate(req: Request): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return this.fail('No token provided', 401);
      }

      const parts = authHeader.split(' ');
      const token = parts[1];

      const response = await fetch(
        'http://tekero-dating-auth-service:8080/api/v1/jwt/validate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        },
      );

      if (!response.ok) {
        let errorMsg: string;
        try {
          const errJson = await response.json();
          errorMsg = errJson?.message || JSON.stringify(errJson);
        } catch {
          errorMsg = await response.text();
        }
        return this.fail(
          `Token validation failed: ${errorMsg}`,
          response.status,
        );
      }

      const body = await response.json();
      const validToken: string = body.token;
      if (!validToken) {
        return this.fail('No token returned from auth service', 401);
      }

      const decoded = decode(validToken);
      if (!decoded || typeof decoded !== 'object') {
        return this.fail('Cannot decode token payload', 401);
      }

      const payload = decoded as JwtPayload;
      const userId = payload.sub;
      const email = payload.email;
      if (!userId || !email) {
        return this.fail('Token payload missing required fields', 401);
      }

      const user = { userId, email };
      return this.success(user);
    } catch (err) {
      console.error('AuthJwtStrategy error:', err);
      return this.error(new UnauthorizedException('Authentication error'));
    }
  }
}
