import { ImageSourcePropType } from 'react-native';
import { SubscriptionRow } from '@/lib/subscriptionStore';
import { icons, IconKey } from '@/constants/icons';

/**
 * Maps the icon string stored in the database to the local ImageSourcePropType.
 * Falls back to `icons.plus` if the key is not found.
 */
const resolveIcon = (iconKey: string | null, name?: string): ImageSourcePropType => {
  if (iconKey) {
    if (iconKey.startsWith('http')) {
      // Rewrite dead Clearbit URLs to Logo.dev
      if (iconKey.includes('logo.clearbit.com/')) {
        const domain = iconKey.split('logo.clearbit.com/')[1]?.split('?')[0];
        if (domain) {
          return { uri: `https://img.logo.dev/${domain}?token=pk_a8tfHR90SISyhJMqlFOFTA&size=120&format=png` };
        }
      }
      return { uri: iconKey };
    }
    if (iconKey in icons && iconKey !== 'plus') {
      return icons[iconKey as IconKey];
    }
  }

  // Fallback: guess from name if icon is 'plus' or null
  if (name) {
    const n = String(name).toLowerCase().trim();
    if (n.includes("netflix")) return icons.netflix;
    if (n.includes("notion")) return icons.notion;
    if (n.includes("dropbox")) return icons.dropbox;
    if (n.includes("chatgpt") || n.includes("openai")) return icons.openai;
    if (n.includes("adobe") || n.includes("creative cloud")) return icons.adobe;
    if (n.includes("medium")) return icons.medium;
    if (n.includes("figma")) return icons.figma;
    if (n.includes("github") || n.includes("copilot")) return icons.github;
    if (n.includes("claude") || n.includes("anthropic")) return icons.claude;
    if (n.includes("canva")) return icons.canva;
    if (n.includes("apple music") || n.includes("spotify") || n.includes("music")) return icons.music;
    
    // Auto-fetch logo using Logo.dev (Clearbit successor)
    const domain = n.replace(/\s+/g, '') + ".com";
    return { uri: `https://img.logo.dev/${domain}?token=pk_a8tfHR90SISyhJMqlFOFTA&size=120&format=png` };
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
  icon: resolveIcon(row.icon, row.name),
});

/**
 * Converts a Supabase SubscriptionRow into an UpcomingSubscription for the horizontal cards.
 */
export const mapRowToUpcoming = (row: SubscriptionRow, daysLeft: number): UpcomingSubscription => ({
  id: row.id,
  name: row.name,
  price: row.price,
  currency: row.currency,
  icon: resolveIcon(row.icon, row.name),
  daysLeft,
});
