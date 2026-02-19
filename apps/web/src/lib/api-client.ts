import type { ApiResponse, ApiError } from '@touchbase/shared';

export class ApiClientError extends Error {
  readonly code: string;
  readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.details = details;
  }
}

class ApiClient {
  private async request<T>(
    method: string,
    url: string,
    options?: { params?: Record<string, unknown>; body?: unknown }
  ): Promise<T> {
    let fullUrl = url;

    if (options?.params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.set(key, String(value));
          }
        }
      }
      const qs = searchParams.toString();
      if (qs) {
        fullUrl += `?${qs}`;
      }
    }

    const headers: Record<string, string> = {};
    let bodyStr: string | undefined;

    if (options?.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      bodyStr = JSON.stringify(options.body);
    }

    const res = await fetch(fullUrl, {
      method,
      headers,
      body: bodyStr,
      credentials: 'same-origin',
    });

    if (!res.ok) {
      let errorBody: ApiError | undefined;
      try {
        errorBody = await res.json();
      } catch {
        // Response body was not valid JSON
      }

      if (errorBody && !errorBody.success) {
        throw new ApiClientError(
          errorBody.error.code,
          errorBody.error.message,
          errorBody.error.details
        );
      }

      throw new ApiClientError(
        'UNKNOWN_ERROR',
        `Request failed with status ${res.status}`
      );
    }

    // Handle 204 No Content (e.g. DELETE responses)
    if (res.status === 204) {
      return undefined as T;
    }

    const json: ApiResponse<T> | ApiError = await res.json();

    if (!json.success) {
      const err = json as ApiError;
      throw new ApiClientError(
        err.error.code,
        err.error.message,
        err.error.details
      );
    }

    return (json as ApiResponse<T>).data;
  }

  get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>('GET', url, { params });
  }

  post<T>(url: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', url, { body });
  }

  patch<T>(url: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', url, { body });
  }

  del<T>(url: string): Promise<T> {
    return this.request<T>('DELETE', url);
  }
}

export const api = new ApiClient();
