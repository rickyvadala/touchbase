import { z } from 'zod';

// === Enums ===

export const ContactChannelTypeSchema = z.enum([
  'phone', 'email', 'linkedin', 'twitter', 'instagram', 'other',
]);

export const SpecialDateTypeSchema = z.enum([
  'birthday', 'anniversary', 'work_anniversary', 'custom',
]);

export const InteractionTypeSchema = z.enum([
  'call', 'text', 'email', 'coffee', 'meal', 'event', 'gift', 'introduction', 'favor', 'other',
]);

export const PingStatusSchema = z.enum(['pending', 'completed', 'skipped', 'snoozed']);
export const PingActionSchema = z.enum(['complete', 'skip', 'snooze']);

export const ContactSortFieldSchema = z.enum([
  'name', 'healthScore', 'lastInteractionAt', 'nextPingAt',
]);

// === Sub-schemas ===

export const ContactChannelSchema = z.object({
  type: ContactChannelTypeSchema,
  value: z.string().min(1),
  label: z.string().optional(),
});

export const SpecialDateSchema = z.object({
  type: SpecialDateTypeSchema,
  date: z.string().min(4), // MM-DD or YYYY-MM-DD
  label: z.string().optional(),
});

export const CircleConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  defaultFrequencyDays: z.number().int().positive(),
  sortOrder: z.number().int().min(0),
  color: z.string().min(1),
});

export const UserSettingsSchema = z.object({
  dailyPingCount: z.number().int().min(1).max(20),
  reminderTime: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().min(1),
  notificationsEnabled: z.boolean(),
  circles: z.array(CircleConfigSchema),
});

// === Full Model Schemas ===

export const ContactSchema = z.object({
  id: z.string(),
  userId: z.string(),
  firstName: z.string().min(1),
  lastName: z.string(),
  photoURL: z.string().url().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  circleId: z.string().min(1),
  tags: z.array(z.string()),
  notes: z.string(),
  howWeMet: z.string().optional(),
  channels: z.array(ContactChannelSchema),
  customFrequencyDays: z.number().int().positive().optional(),
  specialDates: z.array(SpecialDateSchema),
  healthScore: z.number().min(0).max(100),
  lastInteractionAt: z.string().optional(),
  nextPingAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const InteractionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  contactId: z.string(),
  type: InteractionTypeSchema,
  notes: z.string().optional(),
  date: z.string(),
  createdAt: z.string(),
});

export const PingSchema = z.object({
  id: z.string(),
  userId: z.string(),
  contactId: z.string(),
  scheduledDate: z.string(),
  status: PingStatusSchema,
  completedAt: z.string().optional(),
  snoozedUntil: z.string().optional(),
  createdAt: z.string(),
});

// === Derived Schemas (Create / Update) ===

export const CreateContactSchema = ContactSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  healthScore: true,
  lastInteractionAt: true,
  nextPingAt: true,
});

export const UpdateContactSchema = CreateContactSchema.partial();

export const CreateInteractionSchema = InteractionSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const ActOnPingSchema = z.object({
  action: PingActionSchema,
  snoozedUntil: z.string().optional(),
}).refine(
  (data) => data.action !== 'snooze' || data.snoozedUntil,
  { message: 'snoozedUntil is required when action is snooze', path: ['snoozedUntil'] },
);

export const UpdateUserSchema = z.object({
  displayName: z.string().min(1).optional(),
  photoURL: z.string().url().optional(),
  settings: UserSettingsSchema.partial().optional(),
});

// === Query Parameter Schemas ===

export const ListContactsParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  circleId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  healthBelow: z.coerce.number().min(0).max(100).optional(),
  sortBy: ContactSortFieldSchema.optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const ListInteractionsParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  contactId: z.string().optional(),
  type: InteractionTypeSchema.optional(),
  after: z.string().optional(),
  before: z.string().optional(),
});

export const ListPingsParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: PingStatusSchema.optional(),
  scheduledBefore: z.string().optional(),
  scheduledAfter: z.string().optional(),
});
