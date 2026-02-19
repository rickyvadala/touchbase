import { NextResponse } from 'next/server';

import { withAuth, apiSuccess, apiError } from '@/lib/api-helpers';
import { getUser, updateUser } from '@/lib/dal';
import { UpdateUserSchema } from '@touchbase/shared';

/**
 * GET /api/me
 * Return the authenticated user's profile.
 */
export const GET = withAuth(async (_req, { userId }) => {
  try {
    const user = await getUser(userId);

    if (!user) {
      return NextResponse.json(
        apiError('NOT_FOUND', 'User not found', 404),
        { status: 404 },
      );
    }

    return NextResponse.json(apiSuccess(user));
  } catch (err) {
    console.error('GET /api/me error:', err);
    return NextResponse.json(
      apiError('INTERNAL_ERROR', 'Failed to fetch user', 500),
      { status: 500 },
    );
  }
});

/**
 * PATCH /api/me
 * Update the authenticated user's profile and/or settings.
 */
export const PATCH = withAuth(async (req, { userId }) => {
  try {
    const body = await req.json();
    const result = UpdateUserSchema.safeParse(body);

    if (!result.success) {
      const messages = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      return NextResponse.json(
        apiError('VALIDATION_ERROR', messages.join('; '), 400),
        { status: 400 },
      );
    }

    const updated = await updateUser(userId, result.data);
    return NextResponse.json(apiSuccess(updated));
  } catch (err) {
    console.error('PATCH /api/me error:', err);
    const message = err instanceof Error ? err.message : 'Failed to update user';
    return NextResponse.json(
      apiError('INTERNAL_ERROR', message, 500),
      { status: 500 },
    );
  }
});
