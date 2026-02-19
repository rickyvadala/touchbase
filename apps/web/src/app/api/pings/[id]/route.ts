import { NextRequest, NextResponse } from 'next/server';

import { withAuth, apiSuccess, apiError } from '@/lib/api-helpers';
import { actOnPing } from '@/lib/dal';
import { ActOnPingSchema } from '@touchbase/shared';

/**
 * PATCH /api/pings/:id
 * Act on a ping — complete, skip, or snooze.
 */
export const PATCH = withAuth(async (req, { userId, params }) => {
  try {
    const pingId = params!.id;
    const body = await req.json();
    const result = ActOnPingSchema.safeParse(body);

    if (!result.success) {
      const messages = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      return NextResponse.json(
        apiError('VALIDATION_ERROR', messages.join('; '), 400),
        { status: 400 },
      );
    }

    const ping = await actOnPing(userId, pingId, result.data);
    return NextResponse.json(apiSuccess(ping));
  } catch (err) {
    console.error('PATCH /api/pings/[id] error:', err);
    const message = err instanceof Error ? err.message : 'Failed to update ping';
    const status = message === 'Ping not found' ? 404 : 500;
    return NextResponse.json(
      apiError(status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR', message, status),
      { status },
    );
  }
});
