import type { Contact } from './contact';
import type { Ping } from './ping';

export interface DashboardRes {
  todayPings: (Ping & { contact: Contact })[];
  overduePings: number;
  upcomingBirthdays: (Pick<Contact, 'id' | 'firstName' | 'lastName' | 'photoURL'> & {
    date: string;
  })[];
  networkHealth: {
    healthy: number;
    needsAttention: number;
    cold: number;
  };
  streak: number;
}
