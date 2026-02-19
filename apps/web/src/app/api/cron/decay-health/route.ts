import { NextRequest, NextResponse } from 'next/server';

import { apiSuccess, apiError } from '@/lib/api-helpers';
import { adminDb } from '@/lib/firebase-admin';

/**
 * POST /api/cron/decay-health
 * Decay health scores for all contacts based on time since last interaction.
 * Secured with CRON_SECRET in the Authorization header.
 *
 * Decay logic:
 * - Score decays by 1 point per day past the expected contact frequency.
 * - Minimum health score is 0.
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

    const now = Date.now();
    const nowISO = new Date().toISOString();

    // Fetch all contacts in batches
    const snapshot = await adminDb.collection('contacts').get();

    const batch = adminDb.batch();
    let updated = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const lastInteractionAt = data.lastInteractionAt as string | undefined;
      const frequencyDays = (data.customFrequencyDays as number) ?? 30;
      const currentScore = (data.healthScore as number) ?? 50;

      if (!lastInteractionAt) {
        // No interactions yet — decay from default score based on account age
        const createdAt = data.createdAt as string;
        const daysSinceCreation = (now - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const decayWindow = frequencyDays * 2;
        const newScore = Math.max(0, Math.round(50 - (daysSinceCreation / decayWindow) * 50));

        if (newScore !== currentScore) {
          batch.update(doc.ref, { healthScore: newScore, updatedAt: nowISO });
          updated++;
        }
        continue;
      }

      const daysSinceLast = (now - new Date(lastInteractionAt).getTime()) / (1000 * 60 * 60 * 24);
      const decayWindow = frequencyDays * 2;

      // Score decays linearly from 100 to 0 over 2x the frequency window
      const newScore = Math.max(0, Math.round(100 - (daysSinceLast / decayWindow) * 100));

      if (newScore !== currentScore) {
        batch.update(doc.ref, { healthScore: newScore, updatedAt: nowISO });
        updated++;
      }

      // Firestore batches support up to 500 operations
      if (updated > 0 && updated % 499 === 0) {
        await batch.commit();
      }
    }

    // Commit any remaining updates
    if (updated % 499 !== 0 || updated === 0) {
      await batch.commit();
    }

    return NextResponse.json(apiSuccess({ updated }));
  } catch (err) {
    console.error('POST /api/cron/decay-health error:', err);
    return NextResponse.json(
      apiError('INTERNAL_ERROR', 'Failed to decay health scores', 500),
      { status: 500 },
    );
  }
}
