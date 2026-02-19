import type { ISODateTime, PaginationParams, PaginatedResponse, ServerManaged } from './base';

export type InteractionType =
  | 'call'
  | 'text'
  | 'email'
  | 'coffee'
  | 'meal'
  | 'event'
  | 'gift'
  | 'introduction'
  | 'favor'
  | 'other';

export interface Interaction {
  id: string;
  userId: string;
  contactId: string;
  type: InteractionType;
  notes?: string;
  date: ISODateTime;
  createdAt: ISODateTime;
}

/** Create interaction: strip server-managed fields */
export type CreateInteractionReq = Omit<Interaction, ServerManaged>;

/** Interaction response */
export type InteractionRes = Interaction;

/** List interactions response: paginated */
export type ListInteractionsRes = PaginatedResponse<Interaction>;

/** List interactions query parameters */
export interface ListInteractionsParams extends PaginationParams {
  contactId?: string;
  type?: InteractionType;
  after?: ISODateTime;
  before?: ISODateTime;
}
