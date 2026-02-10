/**
 * Standard API response interface.
 */
export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Standard API error response interface.
 */
export interface IApiErrorResponse {
  success: false;
  error: string;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: Record<string, string[]>;
}

/**
 * Paginated response interface.
 */
export interface IPaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: IPaginationMeta;
}

/**
 * Pagination metadata.
 */
export interface IPaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

/**
 * Sort direction type.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration interface.
 */
export interface ISortConfig {
  field: string;
  direction: SortDirection;
}
