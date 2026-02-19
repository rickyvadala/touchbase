import { NextRequest, NextResponse } from 'next/server';

import { apiSuccess, apiError } from '@/lib/api-helpers';
import { adminDb } from '@/lib/firebase-admin';
import { createPing } from '@/lib/dal';

/**
 * POST /api/cron/generate-pings
 * Generate daily pings for contacts that are due.
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

    const today = new Date();
    today.setUTCHours(23, 59, 59, 999);
    const todayEnd = today.toISOString();

    // Find all contacts whose nextPingAt is today or earlier
    const snapshot = await adminDb
      .collection('contacts')
      .where('nextPingAt', '<=', todayEnd)
      .get();

    let generated = 0;

    for (const doc of snapshot.docs) {
      const contact = doc.data();
      const userId = contact.userId as string;
      const contactId = doc.id;
      const nextPingAt = contact.nextPingAt as string;

      // Check if a pending ping already exists for this contact on this date
      const existingPings = await adminDb
        .collection('pings')
        .where('userId', '==', userId)
        .where('contactId', '==', contactId)
        .where('status', '==', 'pending')
        .limit(1)
        .get();

      if (!existingPings.empty) {
        continue; // Skip — there's already a pending ping
      }

      // Create a new pending ping
      await createPing(userId, contactId, nextPingAt);
      generated++;

      // Advance the contact's nextPingAt based on their frequency
      const frequencyDays = (contact.customFrequencyDays as number) ?? 30;
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + frequencyDays);

      await adminDb.collection('contacts').doc(contactId).update({
        nextPingAt: nextDate.toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(apiSuccess({ generated }));
  } catch (err) {
    console.error('POST /api/cron/generate-pings error:', err);
    return NextResponse.json(
      apiError('INTERNAL_ERROR', 'Failed to generate pings', 500),
      { status: 500 },
    );
  }
}
