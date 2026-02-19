import { NextResponse } from 'next/server';

import { withAuth, apiSuccess, apiError, parseSearchParams } from '@/lib/api-helpers';
import { listInteractions, createInteraction } from '@/lib/dal';
import { ListInteractionsParamsSchema, CreateInteractionSchema } from '@touchbase/shared';

/**
 * GET /api/interactions
 * List interactions with filtering and cursor pagination.
 */
export const GET = withAuth(async (req, { userId }) => {
  try {
    const parsed = parseSearchParams(req.url, ListInteractionsParamsSchema);

    if (parsed.error) {
      return NextResponse.json(
        apiError('VALIDATION_ERROR', parsed.error, 400),
        { status: 400 },
      );
    }

    const result = await listInteractions(userId, parsed.data!);
    return NextResponse.json(apiSuccess(result));
  } catch (err) {
    console.error('GET /api/interactions error:', err);
    return NextResponse.json(
      apiError('INTERNAL_ERROR', 'Failed to list interactions', 500),
      { status: 500 },
    );
  }
});

/**
 * POST /api/interactions
 * Create a new interaction and update related contact health.
 */
export const POST = withAuth(async (req, { userId }) => {
  try {
    const body = await req.json();
    const result = CreateInteractionSchema.safeParse(body);

    if (!result.success) {
      const messages = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      return NextResponse.json(
        apiError('VALIDATION_ERROR', messages.join('; '), 400),
        { status: 400 },
      );
    }

    const interaction = await createInteraction(userId, result.data);
    return NextResponse.json(apiSuccess(interaction), { status: 201 });
  } catch (err) {
    console.error('POST /api/interactions error:', err);
    return NextResponse.json(
      apiError('INTERNAL_ERROR', 'Failed to create interaction', 500),
      { status: 500 },
    );
  }
});
