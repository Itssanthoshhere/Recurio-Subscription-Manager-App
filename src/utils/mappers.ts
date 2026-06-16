import { ImageSourcePropType } from 'react-native';
import { SubscriptionRow } from '@/lib/subscriptionStore';
import { icons, IconKey } from '@/constants/icons';

/**
 * Maps the icon string stored in the database to the local ImageSourcePropType.
 * Falls back to `icons.plus` if the key is not found.
 */
const resolveIcon = (iconKey: string | null): ImageSourcePropType => {
  if (iconKey) {
    if (iconKey.startsWith('http')) {
      return { uri: iconKey };
    }
    if (iconKey in icons) {
      return icons[iconKey as IconKey];
    }
  }
  return icons.plus;
};

/**
 * Converts a Supabase SubscriptionRow (snake_case) into the UI Subscription type (camelCase).
 */
export const mapRowToSubscription = (row: SubscriptionRow): Subscription => ({
  id: row.id,
  name: row.name,
  price: row.price,
  currency: row.currency,
  billing: row.billing,
  category: row.category ?? undefined,
  status: row.status,
  startDate: row.start_date ?? undefined,
  renewalDate: row.renewal_date ?? undefined,
  paymentMethod: row.payment_method ?? undefined,
  color: row.color ?? undefined,
  icon: resolveIcon(row.icon),
});

/**
 * Converts a Supabase SubscriptionRow into an UpcomingSubscription for the horizontal cards.
 */
export const mapRowToUpcoming = (row: SubscriptionRow, daysLeft: number): UpcomingSubscription => ({
  id: row.id,
  name: row.name,
  price: row.price,
  currency: row.currency,
  icon: resolveIcon(row.icon),
  daysLeft,
});
