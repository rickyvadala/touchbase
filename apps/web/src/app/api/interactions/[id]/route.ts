import { NextRequest, NextResponse } from 'next/server';

import { withAuth, apiError } from '@/lib/api-helpers';
import { deleteInteraction } from '@/lib/dal';

/**
 * DELETE /api/interactions/:id
 * Delete an interaction.
 */
export const DELETE = withAuth(async (_req, { userId, params }) => {
  try {
    const interactionId = params!.id;
    await deleteInteraction(userId, interactionId);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('DELETE /api/interactions/[id] error:', err);
    const message = err instanceof Error ? err.message : 'Failed to delete interaction';
    const status = message === 'Interaction not found' ? 404 : 500;
    return NextResponse.json(
      apiError(status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR', message, status),
      { status },
    );
  }
});
