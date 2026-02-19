import type { Contact } from '@touchbase/shared';

/** Get contact's full name */
export function getContactName(contact: Pick<Contact, 'firstName' | 'lastName'>): string {
  return `${contact.firstName} ${contact.lastName}`.trim();
}

/** Get contact initials for avatar fallback */
export function getContactInitials(contact: Pick<Contact, 'firstName' | 'lastName'>): string {
  const first = contact.firstName?.[0] || '';
  const last = contact.lastName?.[0] || '';
  return (first + last).toUpperCase() || '?';
}

/** Sort contacts by name */
export function sortContactsByName(contacts: Contact[], order: 'asc' | 'desc' = 'asc'): Contact[] {
  return [...contacts].sort((a, b) => {
    const nameA = getContactName(a).toLowerCase();
    const nameB = getContactName(b).toLowerCase();
    const cmp = nameA.localeCompare(nameB);
    return order === 'asc' ? cmp : -cmp;
  });
}

/** Filter contacts by search query (name, company, tags) */
export function filterContacts(contacts: Contact[], query: string): Contact[] {
  const q = query.toLowerCase().trim();
  if (!q) return contacts;

  return contacts.filter((c) => {
    const name = getContactName(c).toLowerCase();
    const company = (c.company || '').toLowerCase();
    const tags = c.tags.join(' ').toLowerCase();
    return name.includes(q) || company.includes(q) || tags.includes(q);
  });
}
