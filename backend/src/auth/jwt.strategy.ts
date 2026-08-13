import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'secret',
    });
  }

  validate(payload: { sub?: string }): { username: string } {
    if (!payload.sub) {
      throw new HttpException(
        { error: 'Username claim not found or invalid' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { username: payload.sub };
  }
}
