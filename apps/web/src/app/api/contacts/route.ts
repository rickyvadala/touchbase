import { NextResponse } from 'next/server';

import { withAuth, apiSuccess, apiError, parseSearchParams } from '@/lib/api-helpers';
import { listContacts, createContact } from '@/lib/dal';
import { ListContactsParamsSchema, CreateContactSchema } from '@touchbase/shared';

/**
 * GET /api/contacts
 * List contacts with filtering, sorting, and cursor pagination.
 */
export const GET = withAuth(async (req, { userId }) => {
  try {
    const parsed = parseSearchParams(req.url, ListContactsParamsSchema);

    if (parsed.error) {
      return NextResponse.json(
        apiError('VALIDATION_ERROR', parsed.error, 400),
        { status: 400 },
      );
    }

    const result = await listContacts(userId, parsed.data!);
    return NextResponse.json(apiSuccess(result));
  } catch (err) {
    console.error('GET /api/contacts error:', err);
    return NextResponse.json(
      apiError('INTERNAL_ERROR', 'Failed to list contacts', 500),
      { status: 500 },
    );
  }
});

/**
 * POST /api/contacts
 * Create a new contact.
 */
export const POST = withAuth(async (req, { userId }) => {
  try {
    const body = await req.json();
    const result = CreateContactSchema.safeParse(body);

    if (!result.success) {
      const messages = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      return NextResponse.json(
        apiError('VALIDATION_ERROR', messages.join('; '), 400),
        { status: 400 },
      );
    }

    const contact = await createContact(userId, result.data);
    return NextResponse.json(apiSuccess(contact), { status: 201 });
  } catch (err) {
    console.error('POST /api/contacts error:', err);
    return NextResponse.json(
      apiError('INTERNAL_ERROR', 'Failed to create contact', 500),
      { status: 500 },
    );
  }
});
