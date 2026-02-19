/** Server-managed fields that the client never sends */
export type ServerManaged = 'id' | 'userId' | 'createdAt' | 'updatedAt';

/** Server-computed fields that the client never sends */
export type Computed = 'healthScore' | 'lastInteractionAt' | 'nextPingAt';

/** ISO 8601 datetime string */
export type ISODateTime = string;

/** Pagination parameters for list endpoints */
export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
}

/** Successful API response */
export interface ApiResponse<T> {
  success: true;
  data: T;
}

/** Error API response */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** Union type for all API responses */
export type ApiResult<T> = ApiResponse<T> | ApiError;
