# Recurio - Subscription Tracker 📱

This is an [Expo](https://expo.dev) project with Clerk authentication for managing your subscriptions.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Set up environment variables

   Copy `.env.example` to `.env` and add your Clerk publishable key:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and replace `pk_live_REPLACE_ME` with your actual Clerk publishable key from [Clerk Dashboard](https://dashboard.clerk.com/~/api-keys).

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Environment Variables & Production Deployment

### Local Development

- Copy `.env.example` to `.env`
- Add your Clerk publishable key
- **Never commit `.env` to version control**

### Production Builds with EAS

For production builds, configure environment secrets in EAS:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure secrets
eas secret:create --scope project --name EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY --value your_production_key_here
```

The app will automatically read `process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` at runtime. No hardcoded keys are used in production.

For CI/CD pipelines, inject the secret via your platform's environment configuration (GitHub Actions, CircleCI, etc.).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
