import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRepository } from '../../contracts/db/models/user.entity';
import { PassportModule } from '@nestjs/passport';
import { AuthLocalStrategy } from './auth.local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET, JWT_TOKEN_TTL } from '../../config/config';
import { AuthJwtStrategy } from '../../utils/auth.jwt.strategy';
import { SessionsRepository } from '../../contracts/db/models/sessions.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: {
        expiresIn: JWT_TOKEN_TTL,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    AuthLocalStrategy,
    AuthJwtStrategy,
    SessionsRepository,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
