import type { ISODateTime, PaginationParams, PaginatedResponse, ServerManaged, Computed } from './base';

export type ContactChannelType = 'phone' | 'email' | 'linkedin' | 'twitter' | 'instagram' | 'other';

export interface ContactChannel {
  type: ContactChannelType;
  value: string;
  label?: string;
}

export type SpecialDateType = 'birthday' | 'anniversary' | 'work_anniversary' | 'custom';

export interface SpecialDate {
  type: SpecialDateType;
  date: string; // MM-DD or YYYY-MM-DD
  label?: string;
}

export interface Contact {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  photoURL?: string;
  company?: string;
  role?: string;
  circleId: string;
  tags: string[];
  notes: string;
  howWeMet?: string;
  channels: ContactChannel[];
  customFrequencyDays?: number;
  specialDates: SpecialDate[];
  healthScore: number;
  lastInteractionAt?: ISODateTime;
  nextPingAt: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/** Create contact: strip server-managed and computed fields */
export type CreateContactReq = Omit<Contact, ServerManaged | Computed>;

/** Update contact: partial version of create */
export type UpdateContactReq = Partial<CreateContactReq>;

/** Contact response: the full model */
export type ContactRes = Contact;

/** List contacts response: paginated */
export type ListContactsRes = PaginatedResponse<Contact>;

export type ContactSortField = 'name' | 'healthScore' | 'lastInteractionAt' | 'nextPingAt';

/** List contacts query parameters */
export interface ListContactsParams extends PaginationParams {
  circleId?: string;
  tags?: string[];
  search?: string;
  healthBelow?: number;
  sortBy?: ContactSortField;
  sortOrder?: 'asc' | 'desc';
}
