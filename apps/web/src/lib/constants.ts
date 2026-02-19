import type { ContactChannelType, InteractionType, SpecialDateType } from '@touchbase/shared';
import {
  Phone,
  Mail,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
  MessageSquare,
  Coffee,
  UtensilsCrossed,
  Calendar,
  Gift,
  UserPlus,
  Heart,
  Briefcase,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';

// === Circle Options ===

export const CIRCLE_OPTIONS = [
  { value: 'inner', label: 'Inner Circle' },
  { value: 'key', label: 'Key Contacts' },
  { value: 'extended', label: 'Extended Network' },
  { value: 'dormant', label: 'Dormant' },
] as const;

// === Channel Types ===

export const CHANNEL_TYPES: { value: ContactChannelType; label: string; icon: LucideIcon }[] = [
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'other', label: 'Other', icon: Globe },
];

export const CHANNEL_ICON_MAP: Record<ContactChannelType, LucideIcon> = Object.fromEntries(
  CHANNEL_TYPES.map((c) => [c.value, c.icon])
) as Record<ContactChannelType, LucideIcon>;

// === Interaction Types ===

export const INTERACTION_TYPES: { value: InteractionType; label: string; icon: LucideIcon }[] = [
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'text', label: 'Text', icon: MessageSquare },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'coffee', label: 'Coffee', icon: Coffee },
  { value: 'meal', label: 'Meal', icon: UtensilsCrossed },
  { value: 'event', label: 'Event', icon: Calendar },
  { value: 'gift', label: 'Gift', icon: Gift },
  { value: 'introduction', label: 'Intro', icon: UserPlus },
  { value: 'favor', label: 'Favor', icon: Heart },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

// === Special Date Types ===

export const SPECIAL_DATE_TYPES: { value: SpecialDateType; label: string; icon: LucideIcon }[] = [
  { value: 'birthday', label: 'Birthday', icon: Gift },
  { value: 'anniversary', label: 'Anniversary', icon: Heart },
  { value: 'work_anniversary', label: 'Work Anniversary', icon: Briefcase },
  { value: 'custom', label: 'Custom', icon: Calendar },
];

// === Helpers ===

/** Convert YYYY-MM-DD to MM-DD for storage */
export function birthdayToStorage(yyyymmdd: string): string {
  const parts = yyyymmdd.split('-');
  return parts.length === 3 ? `${parts[1]}-${parts[2]}` : yyyymmdd;
}

/** Convert MM-DD to YYYY-MM-DD for date input (uses 2000 as placeholder year) */
export function birthdayToInput(mmdd: string): string {
  const parts = mmdd.split('-');
  return parts.length === 2 ? `2000-${parts[0]}-${parts[1]}` : mmdd;
}

/** Format MM-DD birthday to readable format */
export function formatBirthday(dateStr: string): string {
  const [month, day] = dateStr.split('-').map(Number);
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${monthNames[month - 1]} ${day}`;
}
