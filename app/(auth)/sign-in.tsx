import { useSignIn } from "@clerk/expo";
import { Link, useRouter, type Href } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeAreaView);

const SignIn = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetError, setResetError] = useState("");

  // Validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Client-side validation
  const emailValid =
    emailAddress.length === 0 ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  const passwordValid = password.length > 0;
  const formValid =
    emailAddress.length > 0 && password.length > 0 && emailValid;

  const handleSubmit = async () => {
    if (!formValid) return;

    const { error } = await signIn.password({
      emailAddress,
      password,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      posthog.capture("sign_in_failed", {
        error_code: error.code,
        error_message: error.message,
      });
      return;
    }

    if (signIn.status === "complete") {
      posthog.capture("user_signed_in", {
        method: "password",
      });

      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl("/(tabs)");
          if (url.startsWith("http")) {
            // Only use window.location on web platform
            if (typeof window !== "undefined" && window.location) {
              window.location.href = url;
            } else {
              // On native, just use router navigation
              router.replace("/(tabs)" as Href);
            }
          } else {
            router.replace(url as Href);
          }
        },
      });
    } else if (signIn.status === "needs_second_factor") {
      // The UI will re-render and show the verification form
    } else if (signIn.status === "needs_client_trust") {
      // Send email code for client trust verification
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  const handleForgotPassword = async () => {
    if (!emailValid || emailAddress.length === 0) {
      setEmailTouched(true);
      return;
    }
    setResetError("");
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });
      setIsResettingPassword(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setResetError(err.errors?.[0]?.longMessage || err.message || "Failed to send reset code.");
      posthog.capture("password_reset_request_failed", {
        error_message: err.message,
      });
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword) return;
    setResetError("");
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });

      if (result.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/(tabs)");
            if (url.startsWith("http")) {
              if (typeof window !== "undefined" && window.location) {
                window.location.href = url;
              } else {
                router.replace("/(tabs)" as Href);
              }
            } else {
              router.replace(url as Href);
            }
          },
        });
      } else {
        console.log(result);
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setResetError(err.errors?.[0]?.longMessage || err.message || "Failed to reset password.");
    }
  };

  const handleVerify = async () => {
    try {
      if (signIn.status === "needs_client_trust") {
        await signIn.mfa.verifyEmailCode({ code });
      } else if (signIn.status === "needs_second_factor") {
        const factor = signIn.supportedSecondFactors?.[0];
        if (factor) {
          if (factor.strategy === "totp") {
            await signIn.mfa.verifyTOTP({ code });
          } else if (factor.strategy === "phone_code") {
            await signIn.mfa.verifyPhoneCode({ code });
          } else if (factor.strategy === "email_code") {
            await signIn.mfa.verifyEmailCode({ code });
          } else if (factor.strategy === "backup_code") {
            await signIn.mfa.verifyBackupCode({ code });
          }
        }
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      posthog.capture("sign_in_failed", {
        method: "mfa_verification",
      });
      return; // Return early on verification failure
    }

    try {
      if (signIn.status === "complete") {
        // Track successful sign-in after verification
        posthog.identify(emailAddress, {
          $set: { email: emailAddress },
          $set_once: { first_sign_in_date: new Date().toISOString() },
        });
        posthog.capture('user_signed_in', { email: emailAddress });

        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }

            const url = decorateUrl("/(tabs)");
            if (url.startsWith("http")) {
              // Only use window.location on web platform
              if (typeof window !== "undefined" && window.location) {
                window.location.href = url;
              } else {
                // On native, just use router navigation
                router.replace("/(tabs)" as Href);
              }
            } else {
              router.replace(url as Href);
            }
          },
        });
      } else if (
        signIn.status !== "needs_second_factor" &&
        signIn.status !== "needs_client_trust"
      ) {
        console.error("Sign-in attempt not complete:", signIn);
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Show reset password screen
  if (isResettingPassword) {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="auth-screen"
        >
          <ScrollView
            className="auth-scroll"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="auth-content">
              <View className="auth-brand-block">
                <Text className="auth-title">Reset Password</Text>
                <Text className="auth-subtitle">
                  We sent a code to {emailAddress}
                </Text>
              </View>

              <View className="auth-card">
                <View className="auth-form">
                  {resetError ? (
                    <Text className="auth-error text-center mb-2">{resetError}</Text>
                  ) : null}
                  <View className="auth-field">
                    <Text className="auth-label">Verification Code</Text>
                    <TextInput
                      className="auth-input"
                      value={code}
                      placeholder="Enter the code"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      onChangeText={setCode}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View className="auth-field">
                    <Text className="auth-label">New Password</Text>
                    <TextInput
                      className="auth-input"
                      value={newPassword}
                      placeholder="Enter new password"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      secureTextEntry
                      onChangeText={setNewPassword}
                    />
                  </View>

                  <Pressable
                    className={`auth-button ${(!code || !newPassword) && "auth-button-disabled"}`}
                    onPress={handleResetPassword}
                    disabled={!code || !newPassword}
                  >
                    <Text className="auth-button-text">Reset Password</Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => setIsResettingPassword(false)}
                  >
                    <Text className="auth-secondary-button-text">Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Show verification screen if client trust or second factor is needed
  if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="auth-screen"
        >
          <ScrollView
            className="auth-scroll"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="auth-content">
              {/* Branding */}
              <View className="auth-brand-block">
                <View className="auth-logo-wrap">
                  <View className="auth-logo-mark">
                    <Text className="auth-logo-mark-text">R</Text>
                  </View>
                  <View>
                    <Text className="auth-wordmark">Recurio</Text>
                    <Text className="auth-wordmark-sub">SUBSCRIPTIONS</Text>
                  </View>
                </View>
                <Text className="auth-title">Verify your identity</Text>
                <Text className="auth-subtitle">
                  {signIn.status === "needs_second_factor"
                    ? "Please enter your authentication code"
                    : "We sent a verification code to your email"}
                </Text>
              </View>

              {/* Verification Form */}
              <View className="auth-card">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification Code</Text>
                    <TextInput
                      className="auth-input"
                      value={code}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      autoComplete="one-time-code"
                      maxLength={6}
                    />
                    {errors.fields.code && (
                      <Text className="auth-error">
                        {errors.fields.code.message}
                      </Text>
                    )}
                  </View>

                  <Pressable
                    className={`auth-button ${(!code || fetchStatus === "fetching") && "auth-button-disabled"}`}
                    onPress={handleVerify}
                    disabled={!code || fetchStatus === "fetching"}
                  >
                    <Text className="auth-button-text">
                      {fetchStatus === "fetching" ? "Verifying..." : "Verify"}
                    </Text>
                  </Pressable>

                  {signIn.status === "needs_client_trust" && (
                    <Pressable
                      className="auth-secondary-button"
                      onPress={() => signIn.mfa.sendEmailCode()}
                      disabled={fetchStatus === "fetching"}
                    >
                      <Text className="auth-secondary-button-text">
                        Resend Code
                      </Text>
                    </Pressable>
                  )}

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signIn.reset()}
                    disabled={fetchStatus === "fetching"}
                  >
                    <Text className="auth-secondary-button-text">
                      Start Over
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Main sign-in form
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="auth-screen"
      >
        <ScrollView
          className="auth-scroll"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            {/* Branding */}
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurio</Text>
                  <Text className="auth-wordmark-sub">SUBSCRIPTIONS</Text>
                </View>
              </View>
              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">
                Sign in to continue managing your subscriptions
              </Text>
            </View>

            {/* Sign-In Form */}
            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email Address</Text>
                  <TextInput
                    className={`auth-input ${emailTouched && !emailValid && "auth-input-error"}`}
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="name@example.com"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    onChangeText={setEmailAddress}
                    onBlur={() => setEmailTouched(true)}
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                  {emailTouched && !emailValid && (
                    <Text className="auth-error">
                      Please enter a valid email address
                    </Text>
                  )}
                  {errors.fields.identifier && (
                    <Text className="auth-error">
                      {errors.fields.identifier.message}
                    </Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={`auth-input ${passwordTouched && !passwordValid && "auth-input-error"}`}
                    value={password}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    secureTextEntry
                    onChangeText={setPassword}
                    onBlur={() => setPasswordTouched(true)}
                    autoComplete="password"
                  />
                  {passwordTouched && !passwordValid && (
                    <Text className="auth-error">Password is required</Text>
                  )}
                  {errors.fields.password && (
                    <Text className="auth-error">
                      {errors.fields.password.message}
                    </Text>
                  )}
                  
                  <Pressable onPress={handleForgotPassword} className="mt-1 self-end">
                    <Text className="text-sm font-sans-medium text-accent">Forgot Password?</Text>
                  </Pressable>
                </View>

                <Pressable
                  className={`auth-button ${(!formValid || fetchStatus === "fetching") && "auth-button-disabled"}`}
                  onPress={handleSubmit}
                  disabled={!formValid || fetchStatus === "fetching"}
                >
                  <Text className="auth-button-text">
                    {fetchStatus === "fetching" ? "Signing In..." : "Sign In"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Sign-Up Link */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">{"Don't have an account?"}</Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable>
                  <Text className="auth-link">Create Account</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
