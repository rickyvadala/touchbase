import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import type { ApiResponse, ApiError } from '@touchbase/shared';

import { auth } from '@/lib/auth';

// ---------------------------------------------------------------------------
// Auth middleware
// ---------------------------------------------------------------------------

type AuthenticatedHandler = (
  req: NextRequest,
  context: { userId: string; params?: Record<string, string> },
) => Promise<NextResponse>;

/**
 * Wraps a Next.js Route Handler with session authentication.
 * Responds with 401 if the user is not signed in.
 *
 * Usage:
 * ```ts
 * export const GET = withAuth(async (req, { userId }) => {
 *   // userId is guaranteed to be defined here
 * });
 * ```
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (
    req: NextRequest,
    routeContext: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> => {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        apiError('UNAUTHORIZED', 'You must be signed in to access this resource.', 401),
        { status: 401 },
      );
    }

    const params = routeContext?.params ? await routeContext.params : undefined;
    return handler(req, { userId: session.user.id, params });
  };
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

/**
 * Build a successful API response envelope.
 */
export function apiSuccess<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

/**
 * Build an error API response envelope.
 * Optionally accepts an HTTP status code (not included in the body but useful
 * when paired with `NextResponse.json`).
 */
export function apiError(
  code: string,
  message: string,
  status: number = 400,
): ApiError & { _status: number } {
  return {
    success: false,
    error: { code, message },
    _status: status,
  };
}

// ---------------------------------------------------------------------------
// Search params parser
// ---------------------------------------------------------------------------

/**
 * Parse and validate URLSearchParams against a Zod schema.
 *
 * Converts the URLSearchParams into a plain object, handling repeated keys as
 * arrays, then validates with the provided schema.
 *
 * Returns either `{ data }` on success or `{ error }` with a formatted
 * validation message.
 */
export function parseSearchParams<T extends z.ZodTypeAny>(
  url: string | URL,
  schema: T,
): { data: z.infer<T>; error?: never } | { data?: never; error: string } {
  const searchParams = new URL(url).searchParams;
  const raw: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    const existing = raw[key];
    if (existing !== undefined) {
      raw[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      raw[key] = value;
    }
  });

  const result = schema.safeParse(raw);

  if (!result.success) {
    const messages = result.error.issues.map(
      (issue: z.ZodIssue) => `${issue.path.join('.')}: ${issue.message}`,
    );
    return { error: messages.join('; ') };
  }

  return { data: result.data };
}
