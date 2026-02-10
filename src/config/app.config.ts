import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  name: process.env.APP_NAME || 'NestJS API',
  env: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.PORT || '3000', 10),
  prefix: process.env.APP_PREFIX || 'api',
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // JWT (uncomment when adding auth)
  // jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
  // jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',

  // Database (uncomment when adding database)
  // database: {
  //   host: process.env.DB_HOST || 'localhost',
  //   port: parseInt(process.env.DB_PORT || '5432', 10),
  //   username: process.env.DB_USERNAME || 'postgres',
  //   password: process.env.DB_PASSWORD || 'postgres',
  //   name: process.env.DB_NAME || 'nestjs_db',
  // },
}));
