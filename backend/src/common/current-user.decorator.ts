import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUsername = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<{ user: { username: string } }>();
  return request.user.username;
});
