import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import dayjs from 'dayjs';

import * as SecureStore from 'expo-secure-store';

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
 * Schedules a local notification before each subscription's renewal date based on settings stored in SecureStore.
 * Cancels any existing scheduled notifications for the same subscription first.
 */
export async function scheduleRenewalReminders(
  subscriptions: SubscriptionRenewal[]
): Promise<void> {
  const hasPermission = await registerForPushNotificationsAsync();
  if (!hasPermission) return;

  // Cancel all existing scheduled reminders first
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('[Notifications] Cancelled all existing scheduled notifications.');

  // Load preferences from SecureStore
  const storedEnabled = await SecureStore.getItemAsync('recurio_notif_enabled');
  if (storedEnabled === 'false') {
    console.log('[Notifications] Renewal reminders are disabled in settings.');
    return;
  }

  const storedDaysOffset = await SecureStore.getItemAsync('recurio_notif_days_before');
  const storedTime = await SecureStore.getItemAsync('recurio_notif_time');

  const daysOffset = storedDaysOffset ? parseInt(storedDaysOffset, 10) : 1;
  const timeStr = storedTime || '09:00';
  const [hours, minutes] = timeStr.split(':').map(Number);

  const now = dayjs();

  for (const sub of subscriptions) {
    // Try to parse the renewal date (handles both ISO and DD/MM/YYYY)
    let renewal = dayjs(sub.renewalDate, 'DD/MM/YYYY', true);
    if (!renewal.isValid()) {
      renewal = dayjs(sub.renewalDate);
    }
    if (!renewal.isValid()) continue;

    // Calculate dynamic reminder date/time
    const reminderDate = renewal.subtract(daysOffset, 'day').hour(hours).minute(minutes).second(0).millisecond(0);

    if (reminderDate.isBefore(now)) continue; // Already passed

    // Adjust title/body based on days offset
    let title = '🔔 Subscription Renewing Tomorrow!';
    let body = `${sub.name} renews tomorrow for ${sub.currency}${sub.price}. Tap to review.`;

    if (daysOffset === 0) {
      title = '🔔 Subscription Renewing Today!';
      body = `${sub.name} renews today for ${sub.currency}${sub.price}. Tap to review.`;
    } else if (daysOffset > 1) {
      title = `🔔 Subscription Renewing in ${daysOffset} Days!`;
      body = `${sub.name} renews in ${daysOffset} days for ${sub.currency}${sub.price}. Tap to review.`;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: `renewal-${sub.id}`,
      content: {
        title,
        body,
        data: { subscriptionId: sub.id },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate.toDate(),
      },
    });

    console.log(
      `[Notifications] Scheduled reminder for "${sub.name}" on ${reminderDate.format('DD/MM/YYYY HH:mm')} (${daysOffset} day(s) offset)`
    );
  }
}

/**
 * Cancel a specific subscription's reminder.
 */
export async function cancelRenewalReminder(subscriptionId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`renewal-${subscriptionId}`);
}
