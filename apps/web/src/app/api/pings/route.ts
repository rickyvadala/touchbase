import { NextResponse } from 'next/server';

import { withAuth, apiSuccess, apiError, parseSearchParams } from '@/lib/api-helpers';
import { listPings } from '@/lib/dal';
import { ListPingsParamsSchema } from '@touchbase/shared';

/**
 * GET /api/pings
 * List pings with filtering and cursor pagination.
 */
export const GET = withAuth(async (req, { userId }) => {
  try {
    const parsed = parseSearchParams(req.url, ListPingsParamsSchema);

    if (parsed.error) {
      return NextResponse.json(
        apiError('VALIDATION_ERROR', parsed.error, 400),
        { status: 400 },
      );
    }

    const result = await listPings(userId, parsed.data!);
    return NextResponse.json(apiSuccess(result));
  } catch (err) {
    console.error('GET /api/pings error:', err);
    return NextResponse.json(
      apiError('INTERNAL_ERROR', 'Failed to list pings', 500),
      { status: 500 },
    );
  }
});
