import type { ISODateTime } from './base';

export interface CircleConfig {
  id: string;
  name: string;
  defaultFrequencyDays: number;
  sortOrder: number;
  color: string;
}

export interface UserSettings {
  dailyPingCount: number;
  reminderTime: string;
  timezone: string;
  notificationsEnabled: boolean;
  circles: CircleConfig[];
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  settings: UserSettings;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/** Update user request — partial display info + partial settings */
export type UpdateUserReq = Partial<
  Pick<User, 'displayName' | 'photoURL'> & { settings: Partial<UserSettings> }
>;

/** User response type */
export type UserRes = User;

/** Default circle configurations */
export const DEFAULT_CIRCLES: CircleConfig[] = [
  { id: 'inner', name: 'Inner Circle', defaultFrequencyDays: 10, sortOrder: 0, color: '#E11D48' },
  { id: 'key', name: 'Key Contacts', defaultFrequencyDays: 25, sortOrder: 1, color: '#F97316' },
  { id: 'extended', name: 'Extended Network', defaultFrequencyDays: 75, sortOrder: 2, color: '#0EA5E9' },
  { id: 'dormant', name: 'Dormant', defaultFrequencyDays: 180, sortOrder: 3, color: '#6B7280' },
];

export const DEFAULT_USER_SETTINGS: UserSettings = {
  dailyPingCount: 5,
  reminderTime: '09:00',
  timezone: 'America/New_York',
  notificationsEnabled: true,
  circles: DEFAULT_CIRCLES,
};
