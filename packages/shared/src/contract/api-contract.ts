import type {
  UserRes,
  UpdateUserReq,
  ContactRes,
  CreateContactReq,
  UpdateContactReq,
  ListContactsRes,
  ListContactsParams,
  InteractionRes,
  CreateInteractionReq,
  ListInteractionsRes,
  ListInteractionsParams,
  PingRes,
  ActOnPingReq,
  ListPingsRes,
  ListPingsParams,
  DashboardRes,
} from '../models';

export interface ApiContract {
  // User
  'GET /me': { req: void; res: UserRes };
  'PATCH /me': { req: UpdateUserReq; res: UserRes };

  // Contacts
  'GET /contacts': { req: ListContactsParams; res: ListContactsRes };
  'POST /contacts': { req: CreateContactReq; res: ContactRes };
  'GET /contacts/:id': { req: void; res: ContactRes };
  'PATCH /contacts/:id': { req: UpdateContactReq; res: ContactRes };
  'DELETE /contacts/:id': { req: void; res: void };

  // Interactions
  'GET /interactions': { req: ListInteractionsParams; res: ListInteractionsRes };
  'POST /interactions': { req: CreateInteractionReq; res: InteractionRes };
  'DELETE /interactions/:id': { req: void; res: void };

  // Pings
  'GET /pings': { req: ListPingsParams; res: ListPingsRes };
  'PATCH /pings/:id': { req: ActOnPingReq; res: PingRes };

  // Dashboard
  'GET /dashboard': { req: void; res: DashboardRes };

  // Cron (secured with CRON_SECRET)
  'POST /cron/generate-pings': { req: void; res: { generated: number } };
  'POST /cron/decay-health': { req: void; res: { updated: number } };
  'POST /cron/weekly-digest': { req: void; res: { sent: boolean } };
}

/** API endpoint paths */
export const API_PATHS = {
  me: '/api/me',
  contacts: '/api/contacts',
  contact: (id: string) => `/api/contacts/${id}`,
  interactions: '/api/interactions',
  interaction: (id: string) => `/api/interactions/${id}`,
  pings: '/api/pings',
  ping: (id: string) => `/api/pings/${id}`,
  dashboard: '/api/dashboard',
  cronGeneratePings: '/api/cron/generate-pings',
  cronDecayHealth: '/api/cron/decay-health',
  cronWeeklyDigest: '/api/cron/weekly-digest',
} as const;
