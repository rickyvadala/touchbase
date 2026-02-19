import { NextRequest, NextResponse } from 'next/server';

import { apiSuccess, apiError } from '@/lib/api-helpers';

/**
 * POST /api/cron/weekly-digest
 * Placeholder for weekly digest email generation.
 * Secured with CRON_SECRET in the Authorization header.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        apiError('UNAUTHORIZED', 'Invalid or missing cron secret', 401),
        { status: 401 },
      );
    }

    // TODO: Implement weekly digest generation
    // 1. Fetch all users
    // 2. For each user, gather weekly stats:
    //    - Pings completed vs total
    //    - New interactions logged
    //    - Health score changes
    //    - Upcoming birthdays
    // 3. Send digest email via email service

    return NextResponse.json(apiSuccess({ sent: true }));
  } catch (err) {
    console.error('POST /api/cron/weekly-digest error:', err);
    return NextResponse.json(
      apiError('INTERNAL_ERROR', 'Failed to send weekly digest', 500),
      { status: 500 },
    );
  }
}
