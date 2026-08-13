import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string } }>();
    const tokenString = request.headers.authorization;
    if (!tokenString) {
      throw new HttpException({ error: 'Authorization header required' }, HttpStatus.UNAUTHORIZED);
    }
    if (tokenString.length < 7 || !tokenString.startsWith('Bearer ')) {
      throw new HttpException(
        { error: 'Invalid token format (missing Bearer prefix)' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return super.canActivate(context);
  }

  handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err || !user) {
      throw new HttpException({ error: 'Invalid or expired token' }, HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
