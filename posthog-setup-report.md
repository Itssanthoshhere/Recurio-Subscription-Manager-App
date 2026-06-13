<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurio subscription manager app. The SDK is initialised in `src/config/posthog.ts` via `expo-constants` (reading token and host from `app.config.js` extras, which in turn read from `.env`). `PostHogProvider` wraps the app in `app/_layout.tsx`, which also handles centralised user identification using the Clerk user ID (non-PII) and manual screen tracking for Expo Router. Eight events are captured across six files, covering the full auth lifecycle and subscription engagement.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | User successfully completes registration and email verification | `app/(auth)/sign-up.tsx` |
| `sign_up_failed` | Sign-up or email verification step failed | `app/(auth)/sign-up.tsx` |
| `user_signed_in` | User successfully signs in (password or MFA) | `app/(auth)/sign-in.tsx` |
| `sign_in_failed` | Sign-in attempt failed (password or MFA verification) | `app/(auth)/sign-in.tsx` |
| `user_signed_out` | User signs out from the Settings screen | `app/(tabs)/settings.tsx` |
| `subscription_expanded` | User taps a subscription card to expand its details | `app/(tabs)/index.tsx` |
| `subscription_details_viewed` | User opens the full-screen subscription detail page | `app/subscriptions/[id].tsx` |
| `onboarding_viewed` | User arrives at the onboarding screen | `app/onboarding.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behaviour, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/468979/dashboard/1709208)
- [New sign-ups over time](https://us.posthog.com/project/468979/insights/dl1baHK7)
- [Daily sign-ins](https://us.posthog.com/project/468979/insights/r2bTuGjZ)
- [Auth conversion funnel (onboarding → sign-up)](https://us.posthog.com/project/468979/insights/MrYhJGIp)
- [Sign-in failure rate](https://us.posthog.com/project/468979/insights/YjWrQwmm)
- [Subscription engagement](https://us.posthog.com/project/468979/insights/1UUUfnwF)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-expo/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
