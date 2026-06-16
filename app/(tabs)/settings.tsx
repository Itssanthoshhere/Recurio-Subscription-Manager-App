import { Text, View, Pressable, Image, TextInput, ScrollView } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useClerk, useUser, useAuth } from "@clerk/expo";
import images from "@/constants/images";
import { useState, useEffect } from "react";
import { usePostHog } from "posthog-react-native";
import * as SecureStore from 'expo-secure-store';
import Feather from "@expo/vector-icons/Feather";
import { scheduleRenewalReminders } from "@/src/services/notificationService";
import { SubscriptionService } from "@/src/services/subscriptionService";
import { createClerkSupabaseClient } from "@/src/config/supabase";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { getToken } = useAuth();
  const posthog = usePostHog();
  
  // Sign-out state
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  // Collapsible sections
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("");

  // Notifications preferences state
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifDaysOffset, setNotifDaysOffset] = useState(1);
  const [notifTime, setNotifTime] = useState("09:00");

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const enabled = await SecureStore.getItemAsync('recurio_notif_enabled');
        const days = await SecureStore.getItemAsync('recurio_notif_days_before');
        const time = await SecureStore.getItemAsync('recurio_notif_time');

        if (enabled !== null) setNotifEnabled(enabled !== 'false');
        if (days !== null) setNotifDaysOffset(parseInt(days, 10));
        if (time !== null) setNotifTime(time);
      } catch (err) {
        console.error("[Settings] Failed to load preferences:", err);
      }
    };
    loadPreferences();
  }, []);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setSignOutError(null);

    try {
      posthog.capture("user_signed_out");
      await signOut();
      posthog.reset();
    } catch (err: any) {
      console.error('Sign-out failed:', err);
      setSignOutError(err.message || "Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) return;

    setIsChangingPassword(true);
    setChangePasswordError("");
    setChangePasswordSuccess("");

    try {
      await user?.updatePassword({
        currentPassword,
        newPassword,
      });
      setChangePasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      posthog.capture("user_password_changed");
    } catch (err: any) {
      console.error('Change password failed:', err);
      setChangePasswordError(err.message || err.errors?.[0]?.longMessage || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const updateNotificationSetting = async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
      posthog.capture("notification_preference_updated", { key, value });

      // Reschedule reminders instantly using the new settings
      const supabase = createClerkSupabaseClient(getToken);
      const service = new SubscriptionService(supabase);
      const rows = await service.getSubscriptions();
      const renewals = rows
        .filter((s) => s.renewal_date)
        .map((s) => ({
          id: s.id,
          name: s.name,
          renewalDate: s.renewal_date!,
          price: s.price,
          currency: s.currency,
        }));
      await scheduleRenewalReminders(renewals);
    } catch (err) {
      console.error("[Settings] Failed to save and reschedule reminders:", err);
    }
  };

  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";
  const email = user?.emailAddresses[0]?.emailAddress;

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-3xl font-sans-bold text-primary mb-6">
        Settings
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* User Profile Section */}
        <View className="auth-card mb-5">
          <View className="flex-row items-center gap-4">
            <Image
              source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
              className="size-16 rounded-full"
            />
            <View className="flex-1">
              <Text className="text-lg font-sans-bold text-primary">
                {displayName}
              </Text>
              {email && (
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  {email}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Notification Preferences Card */}
        <View className="auth-card mb-5">
          <Text className="text-base font-sans-semibold text-primary mb-3">Notification Preferences</Text>
          
          <View className="flex-row justify-between items-center py-2">
            <View className="flex-1 mr-4">
              <Text className="text-sm font-sans-semibold text-primary">Renewal Reminders</Text>
              <Text className="text-xs font-sans-medium text-muted-foreground">Receive push notification alerts</Text>
            </View>
            <Pressable 
              className={`w-12 h-7 rounded-full p-0.5 justify-center ${notifEnabled ? 'bg-accent' : 'bg-muted'}`}
              onPress={async () => {
                const nextVal = !notifEnabled;
                setNotifEnabled(nextVal);
                await updateNotificationSetting('recurio_notif_enabled', String(nextVal));
              }}
            >
              <View className={`size-6 rounded-full bg-white shadow-sm transform ${notifEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </Pressable>
          </View>

          {notifEnabled && (
            <View className="mt-4 gap-4 border-t border-border pt-4">
              {/* Days Before Options */}
              <View className="auth-field">
                <Text className="auth-label">Remind me</Text>
                <View className="flex-row flex-wrap gap-2">
                  {[
                    { label: 'Same Day', value: 0 },
                    { label: '1 Day Before', value: 1 },
                    { label: '2 Days Before', value: 2 },
                    { label: '3 Days Before', value: 3 },
                    { label: '1 Week Before', value: 7 },
                  ].map((option) => {
                    const active = notifDaysOffset === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        className={`px-3 py-2 rounded-full border ${active ? 'border-accent bg-accent/10' : 'border-border bg-background'}`}
                        onPress={async () => {
                          setNotifDaysOffset(option.value);
                          await updateNotificationSetting('recurio_notif_days_before', String(option.value));
                        }}
                      >
                        <Text className={`text-xs font-sans-semibold ${active ? 'text-accent' : 'text-muted-foreground'}`}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Time Options */}
              <View className="auth-field">
                <Text className="auth-label">Reminder Time</Text>
                <View className="flex-row flex-wrap gap-2">
                  {[
                    { label: '08:00 AM', value: '08:00' },
                    { label: '09:00 AM', value: '09:00' },
                    { label: '12:00 PM', value: '12:00' },
                    { label: '06:00 PM', value: '18:00' },
                    { label: '08:00 PM', value: '20:00' },
                  ].map((option) => {
                    const active = notifTime === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        className={`px-3 py-2 rounded-full border ${active ? 'border-accent bg-accent/10' : 'border-border bg-background'}`}
                        onPress={async () => {
                          setNotifTime(option.value);
                          await updateNotificationSetting('recurio_notif_time', option.value);
                        }}
                      >
                        <Text className={`text-xs font-sans-semibold ${active ? 'text-accent' : 'text-muted-foreground'}`}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Security & Password Card */}
        <View className="auth-card mb-5">
          <Pressable 
            className="flex-row justify-between items-center py-1"
            onPress={() => setShowChangePassword(!showChangePassword)}
          >
            <Text className="text-base font-sans-semibold text-primary">Security & Password</Text>
            <Feather name={showChangePassword ? "chevron-up" : "chevron-down"} size={20} color="#081126" />
          </Pressable>

          {showChangePassword && (
            <View className="mt-4 gap-4 border-t border-border pt-4">
              {changePasswordError ? (
                <Text className="auth-error text-center mb-1">{changePasswordError}</Text>
              ) : null}
              {changePasswordSuccess ? (
                <Text className="text-green-600 text-center text-sm font-sans-semibold mb-1">{changePasswordSuccess}</Text>
              ) : null}
              
              <View className="auth-field">
                <Text className="auth-label">Current Password</Text>
                <TextInput
                  className="auth-input"
                  secureTextEntry
                  placeholder="Enter current password"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">New Password</Text>
                <TextInput
                  className="auth-input"
                  secureTextEntry
                  placeholder="Enter new password"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>

              <Pressable
                className={`auth-button ${(!currentPassword || !newPassword || isChangingPassword) ? "auth-button-disabled" : ""}`}
                disabled={!currentPassword || !newPassword || isChangingPassword}
                onPress={handleUpdatePassword}
              >
                <Text className="auth-button-text">
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Account Details Section */}
        <View className="auth-card mb-5">
          <Text className="text-base font-sans-semibold text-primary mb-3">
            Account Details
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-sm font-sans-medium text-muted-foreground">
                Account ID
              </Text>
              <Text
                className="text-sm font-sans-medium text-primary font-mono"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {user?.id 
                  ? user.id.length > 20 
                    ? `${user.id.substring(0, 20)}...` 
                    : user.id 
                  : "No ID"}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-sm font-sans-medium text-muted-foreground">
                Joined
              </Text>
              <Text className="text-sm font-sans-medium text-primary">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <Pressable 
          className={`auth-button bg-destructive ${isSigningOut ? "opacity-50" : ""}`} 
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          <Text className="auth-button-text text-white">
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </Text>
        </Pressable>
        
        {signOutError && (
          <Text className="text-destructive text-center mt-2 text-sm font-sans-medium">
            {signOutError}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
