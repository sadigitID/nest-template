import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Custom decorator to extract the client IP address from the request.
 *
 * @example
 * @Get()
 * findAll(@ClientIp() ip: string) {
 *   console.log(ip);
 * }
 */
export const ClientIp = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0]?.trim() ?? request.ip ?? 'unknown';
    }
    return request.ip ?? 'unknown';
  },
);
