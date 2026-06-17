# 📱 Recurio — Subscription Manager App

A Premium, High-Fidelity Expo & React Native Application to Track, Manage, and Optimize Your Recurring Subscriptions.

---

## 📋 Table of Contents

- [📱 Recurio — Subscription Manager App](#-recurio--subscription-manager-app)
  - [📋 Table of Contents](#-table-of-contents)
  - [📖 About The Project](#-about-the-project)
  - [✨ Features](#-features)
    - [🔐 Authentication Gate](#-authentication-gate)
    - [📊 Dashboard \& Tracking](#-dashboard--tracking)
    - [✏️ Edit Subscription modal](#️-edit-subscription-modal)
    - [📈 Expense Insights](#-expense-insights)
    - [⚙️ Secure Settings](#️-secure-settings)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [🏗️ Project Structure](#️-project-structure)
  - [🚀 Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [📦 Latest Build](#-latest-build)
  - [🎯 Key Components](#-key-components)
    - [1. `<CreateSubscriptionModal />`](#1-createsubscriptionmodal-)
    - [2. `<SubscriptionCard />`](#2-subscriptioncard-)
  - [🤝 Contributing](#-contributing)
  - [📜 License \& Attribution](#-license--attribution)

---

## 📖 About The Project

**Recurio** is a pixel-perfect, feature-rich subscription tracking mobile app. Built on the modern Expo SDK 54, it addresses the real-world challenge of "subscription fatigue" by giving users an elegant control center to monitor payments, analyze costs, customize designs, and receive timely alerts before renewals hit.

This project serves as a comprehensive study of:

- 🔑 Secure, identity-first auth integration with **Clerk**
- ⚡ Optimistic UI updates with **Zustand** client state caching
- 🗄️ Real-time backend queries and mutations via **Supabase**
- 🔔 Local push notifications configured dynamically with user settings
- 🎨 Responsive hybrid layouts powered by **NativeWind v5**

---

## ✨ Features

### 🔐 Authentication Gate

- Managed secure onboarding flows using **Clerk**.
- Supports standard signup verification pins, MFA, and JWT session handling.

### 📊 Dashboard & Tracking

- Dynamic list displaying active subscriptions sorted by Newest, Cost, or Renewal Date.
- Search filter to query items instantly.
- Collapsible cards displaying subscription metadata (Payment method, start date, renewal, and status).
- Direct route navigation from cards to detailed views.

### ✏️ Edit Subscription modal

- Reusable slide-up bottom sheet modal that adapts seamlessly between Creation and Edit modes.
- Pre-populated form fields on edit mode with automatic date-separator `/` formatting as you type.
- **Custom Card Color Selection**: A curated palette of 10 modern colors allows styling cards individually to prevent duplicate themes.

### 📈 Expense Insights

- Interactive **Bar Chart** detailing expenses across categories (Entertainment, AI Tools, Dev Tools, Design, Productivity, etc.).
- Active monthly expenditure aggregates formatted in local currency.

### ⚙️ Secure Settings

- **Notification Controls**: Toggle reminders, customize alert intervals (days before renewal), and set target times.
- State-preserving credentials update inputs.

---

## 🛠️ Tech Stack

| Category      | Technology         | Version | Purpose                                                |
| :------------ | :----------------- | :------ | :----------------------------------------------------- |
| **Framework** | Expo SDK           | 54.0.34 | Cross-platform build & deploy system                   |
| **Runtime**   | React Native       | 0.81.5  | Native mobile performance and widgets                  |
| **Backend**   | Supabase           | 2.108.1 | PostgreSQL backend database client                     |
| **Auth**      | Clerk              | 3.4.2   | High-fidelity user accounts & identity provider        |
| **State**     | Zustand            | 1.0.0   | Lightweight global client state caching                |
| **Styling**   | NativeWind         | 5.0.0   | Tailwind v4 utility class compilation for React Native |
| **Alerts**    | Expo Notifications | 0.32.17 | Scheduling background renewal reminders                |
| **Storage**   | Expo Secure Store  | 15.0.8  | Encrypting configurations at rest                      |

---

## 🏗️ Project Structure

```
recurio-subscription-manager-app/
│
├── 📁 app/                           # Expo Router Screens & File Routing
│   ├── 📁 (auth)/                    # User identity screens (Sign In / Sign Up)
│   ├── 📁 (tabs)/                    # Main bottom navigation screens
│   │   ├── index.tsx                 # Dashboard screen
│   │   ├── insights.tsx              # Spending analytics and charts
│   │   ├── settings.tsx              # Notifications & account credentials settings
│   │   └── subscriptions.tsx         # Detailed subscription search list
│   ├── 📁 subscriptions/             # Detailed dynamic routes
│   │   └── [id].tsx                  # Details, editing, status toggle, and deletion page
│   └── onboarding.tsx                # Onboarding landing layout
│
├── 📁 components/                    # Reusable UI widgets
│   ├── BarChart.tsx                  # SVG bar metrics display
│   ├── CreateSubscriptionModal.tsx   # Slide-up modal for creation & editing
│   ├── SubscriptionCard.tsx          # Dashboard subscription card (collapsible detail actions)
│   └── UpcomingSubscriptionCard.tsx  # Horizontal upcoming card
│
├── 📁 src/                           # Domain architecture layers
│   ├── 📁 hooks/
│   │   └── useSubscriptions.ts       # React query custom hook wrapper
│   ├── 📁 services/
│   │   ├── notificationService.ts    # Background push notification scheduler
│   │   └── subscriptionService.ts    # Supabase CRUD service layer
│   └── 📁 utils/
│       └── mappers.ts                # Model translator (Supabase snake_case ➔ UI camelCase)
│
├── 📁 lib/                           # Global configuration helpers
│   ├── subscriptionStore.ts          # Zustand store definitions (optimistic state)
│   └── utils.ts                      # Date formatting & currency parser helpers
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js >= 18.0.0
- npm >= 9.0.0
- iOS Simulator or Android Emulator

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Itssanthoshhere/Recurio-Subscription-Manager-App.git
   cd Recurio-Subscription-Manager-App
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Copy `.env.example` to `.env` and supply your secrets:

   ```bash
   cp .env.example .env
   ```

   Add your Clerk publishable key and Supabase credentials.

4. **Start the Expo server**
   ```bash
   npx expo start
   ```

Press `i` to launch the iOS simulator or `a` to launch the Android emulator.

---

## 📦 Latest Build

- **Android Preview Build**: [View on EAS](https://expo.dev/accounts/itssanthoshhere/projects/recurio-subscription-manager-app/builds/12b87966-fe02-4b6d-b65f-3c3947cc7795)
- **APK Download**: `Recurio-v1.0.0.apk`

---

## 🎯 Key Components

### 1. `<CreateSubscriptionModal />`

A versatile slide-up bottom sheet modal that dynamically handles creation and editing.

- Intercepts layout sizes with sibling absolute backdrops to prevent React Native gesture conflicts with `<ScrollView>`.
- Pre-populates fields on load and uses an auto-slash input formatter for dates.

### 2. `<SubscriptionCard />`

An expandable list card featuring color overrides.

- Integrates a **"View Details & Edit"** action button that pushes the item's router path to the subscription page.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add custom notifications theme'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License & Attribution

This project is for educational and portfolio purposes.
Developed by **V S Santhosh**.

⭐ If this project helped you understand hybrid mobile state architecture, please give it a star!
