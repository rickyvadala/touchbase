import type { ISODateTime, PaginationParams, PaginatedResponse } from './base';

export type PingStatus = 'pending' | 'completed' | 'skipped' | 'snoozed';
export type PingAction = 'complete' | 'skip' | 'snooze';

export interface Ping {
  id: string;
  userId: string;
  contactId: string;
  scheduledDate: ISODateTime;
  status: PingStatus;
  completedAt?: ISODateTime;
  snoozedUntil?: ISODateTime;
  createdAt: ISODateTime;
}

/** Act on a ping (complete, skip, snooze) */
export interface ActOnPingReq {
  action: PingAction;
  snoozedUntil?: ISODateTime;
}

/** Ping response */
export type PingRes = Ping;

/** List pings response: paginated */
export type ListPingsRes = PaginatedResponse<Ping>;

/** List pings query parameters */
export interface ListPingsParams extends PaginationParams {
  status?: PingStatus;
  scheduledBefore?: ISODateTime;
  scheduledAfter?: ISODateTime;
}
