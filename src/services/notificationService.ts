import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import dayjs from 'dayjs';

// ─── Notification Behaviour ───────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Request Permissions ──────────────────────────────────────────────────────
export async function registerForPushNotificationsAsync(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('[Notifications] Must use physical device for notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Notifications] Permission not granted');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('renewal-reminders', {
      name: 'Renewal Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C63FF',
    });
  }

  return true;
}

// ─── Schedule Renewal Reminders ───────────────────────────────────────────────
export interface SubscriptionRenewal {
  id: string;
  name: string;
  renewalDate: string; // ISO or DD/MM/YYYY
  price: number;
  currency: string;
}

/**
 * Schedules a local notification 1 day before each subscription's renewal date.
 * Cancels any existing scheduled notifications for the same subscription first.
 */
export async function scheduleRenewalReminders(
  subscriptions: SubscriptionRenewal[]
): Promise<void> {
  const hasPermission = await registerForPushNotificationsAsync();
  if (!hasPermission) return;

  // Cancel all existing scheduled reminders first
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = dayjs();

  for (const sub of subscriptions) {
    // Try to parse the renewal date (handles both ISO and DD/MM/YYYY)
    let renewal = dayjs(sub.renewalDate, 'DD/MM/YYYY', true);
    if (!renewal.isValid()) {
      renewal = dayjs(sub.renewalDate);
    }
    if (!renewal.isValid()) continue;

    // Schedule notification for 9 AM, 1 day before renewal
    const reminderDate = renewal.subtract(1, 'day').hour(9).minute(0).second(0).millisecond(0);

    if (reminderDate.isBefore(now)) continue; // Already passed

    await Notifications.scheduleNotificationAsync({
      identifier: `renewal-${sub.id}`,
      content: {
        title: '🔔 Subscription Renewing Tomorrow!',
        body: `${sub.name} renews tomorrow for ${sub.currency}${sub.price}. Tap to review.`,
        data: { subscriptionId: sub.id },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate.toDate(),
      },
    });

    console.log(
      `[Notifications] Scheduled reminder for "${sub.name}" on ${reminderDate.format('DD/MM/YYYY HH:mm')}`
    );
  }
}

/**
 * Cancel a specific subscription's reminder.
 */
export async function cancelRenewalReminder(subscriptionId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`renewal-${subscriptionId}`);
}
