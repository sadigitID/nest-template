import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public (skip authentication).
 *
 * @example
 * @Public()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 */
export const Public = () =>
  applyDecorators(
    SetMetadata(IS_PUBLIC_KEY, true),
    ApiHeader({
      name: 'Authorization',
      required: false,
      description: 'Not required for public endpoints',
    }),
  );
