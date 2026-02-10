import { Injectable } from '@nestjs/common';

interface HealthStatus {
  status: string;
  timestamp: number;
  uptime: number;
  environment: string;
}

@Injectable()
export class HealthService {
  check(): HealthStatus {
    return {
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
