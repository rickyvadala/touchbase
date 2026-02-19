import { NextRequest, NextResponse } from 'next/server';

import { withAuth, apiSuccess, apiError } from '@/lib/api-helpers';
import { getContact, updateContact, deleteContact } from '@/lib/dal';
import { UpdateContactSchema } from '@touchbase/shared';

/**
 * GET /api/contacts/:id
 * Get a single contact by ID.
 */
export const GET = withAuth(async (_req, { userId, params }) => {
  try {
    const contactId = params!.id;
    const contact = await getContact(userId, contactId);

    if (!contact) {
      return NextResponse.json(
        apiError('NOT_FOUND', 'Contact not found', 404),
        { status: 404 },
      );
    }

    return NextResponse.json(apiSuccess(contact));
  } catch (err) {
    console.error('GET /api/contacts/[id] error:', err);
    return NextResponse.json(
      apiError('INTERNAL_ERROR', 'Failed to fetch contact', 500),
      { status: 500 },
    );
  }
});

/**
 * PATCH /api/contacts/:id
 * Update a contact.
 */
export const PATCH = withAuth(async (req, { userId, params }) => {
  try {
    const contactId = params!.id;
    const body = await req.json();
    const result = UpdateContactSchema.safeParse(body);

    if (!result.success) {
      const messages = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      return NextResponse.json(
        apiError('VALIDATION_ERROR', messages.join('; '), 400),
        { status: 400 },
      );
    }

    const updated = await updateContact(userId, contactId, result.data);
    return NextResponse.json(apiSuccess(updated));
  } catch (err) {
    console.error('PATCH /api/contacts/[id] error:', err);
    const message = err instanceof Error ? err.message : 'Failed to update contact';
    const status = message === 'Contact not found' ? 404 : 500;
    return NextResponse.json(
      apiError(status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR', message, status),
      { status },
    );
  }
});

/**
 * DELETE /api/contacts/:id
 * Delete a contact.
 */
export const DELETE = withAuth(async (_req, { userId, params }) => {
  try {
    const contactId = params!.id;
    await deleteContact(userId, contactId);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('DELETE /api/contacts/[id] error:', err);
    const message = err instanceof Error ? err.message : 'Failed to delete contact';
    const status = message === 'Contact not found' ? 404 : 500;
    return NextResponse.json(
      apiError(status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR', message, status),
      { status },
    );
  }
});
