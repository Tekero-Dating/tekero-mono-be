import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class AuthLocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  /**
   * Passport expects a validate() method with the following signature:
   * validate(username: string, password:string): any.
   * We've replaced expectations from username to email in super method
   * of the constructor. "validate" method attaching returning value
   * to the field "user" of the request object.
   */
  async validate(email: string, password: string) {
    const user = await this.authService.validateUserCredentials(
      email,
      password,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
