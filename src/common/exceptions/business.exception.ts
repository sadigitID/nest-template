import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom exception for business logic errors.
 */
export class BusinessException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(
      {
        success: false,
        error: message,
        statusCode,
      },
      statusCode,
    );
  }
}

/**
 * Custom exception for entity not found.
 */
export class EntityNotFoundException extends HttpException {
  constructor(entity: string, id: string) {
    super(
      {
        success: false,
        error: `${entity} with id '${id}' not found`,
        statusCode: HttpStatus.NOT_FOUND,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Custom exception for duplicate entity.
 */
export class DuplicateEntityException extends HttpException {
  constructor(entity: string, field: string) {
    super(
      {
        success: false,
        error: `${entity} with this ${field} already exists`,
        statusCode: HttpStatus.CONFLICT,
      },
      HttpStatus.CONFLICT,
    );
  }
}
