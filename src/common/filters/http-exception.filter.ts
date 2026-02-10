import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  success: false;
  error: string;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: Record<string, string[]>;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: ErrorResponse = {
      success: false,
      error: this.getErrorMessage(exceptionResponse),
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Add validation details if available
    const details = this.getValidationDetails(exceptionResponse);
    if (details) {
      errorResponse.details = details;
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} ${status}`,
        exception.stack,
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} ${status}`);
    }

    response.status(status).json(errorResponse);
  }

  private getErrorMessage(response: string | object): string {
    if (typeof response === 'string') {
      return response;
    }

    if ('message' in response) {
      const message = (response as { message: string | string[] }).message;
      return Array.isArray(message) ? message[0] ?? 'Validation failed' : message;
    }

    return 'Internal server error';
  }

  private getValidationDetails(
    response: string | object,
  ): Record<string, string[]> | undefined {
    if (typeof response === 'object' && 'message' in response) {
      const message = (response as { message: string | string[] }).message;
      if (Array.isArray(message) && message.length > 1) {
        return { validation: message };
      }
    }
    return undefined;
  }
}
