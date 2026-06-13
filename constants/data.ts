import { icons } from "./icons";

export const tabs: AppTab[] = [
  { name: "index", title: "Home", icon: icons.home },
  { name: "subscriptions", title: "Subscriptions", icon: icons.wallet },
  { name: "insights", title: "Insights", icon: icons.activity },
  { name: "settings", title: "Settings", icon: icons.setting },
];

export const HOME_USER = {
  name: "Sandyy",
};

export const HOME_BALANCE = {
  amount: 2489.48,
  nextRenewalDate: "2026-07-18T09:00:00.000Z",
};

export const UPCOMING_SUBSCRIPTIONS: UpcomingSubscription[] = [
  {
    id: "music",
    icon: icons.music,
    name: "Apple Music",
    price: 59.99,
    currency: "INR",
    daysLeft: 2,
  },
  {
    id: "notion",
    icon: icons.notion,
    name: "Notion",
    price: 12.0,
    currency: "INR",
    daysLeft: 4,
  },
  {
    id: "figma",
    icon: icons.figma,
    name: "Figma",
    price: 15.0,
    currency: "INR",
    daysLeft: 6,
  },
];

export const HOME_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "adobe-creative-cloud",
    icon: icons.adobe,
    name: "Adobe Creative Cloud",
    plan: "Teams Plan",
    category: "Design",
    paymentMethod: "Visa ending in 8530",
    status: "active",
    startDate: "2025-03-20T10:00:00.000Z",
    price: 77.49,
    currency: "INR",
    billing: "Monthly",
    renewalDate: "2026-06-15T10:00:00.000Z",
    color: "#f5c542",
  },
  {
    id: "github-pro",
    icon: icons.github,
    name: "GitHub Pro",
    plan: "Developer",
    category: "Developer Tools",
    paymentMethod: "Mastercard ending in 2408",
    status: "active",
    startDate: "2024-11-24T10:00:00.000Z",
    price: 90.99,
    currency: "INR",
    billing: "Monthly",
    renewalDate: "2026-06-18T10:00:00.000Z",
    color: "#e8def8",
  },
  {
    id: "claude-pro",
    icon: icons.claude,
    name: "Claude Pro",
    plan: "Pro Plan",
    category: "AI Tools",
    paymentMethod: "Amex ending in 1010",
    status: "active",
    startDate: "2025-06-27T10:00:00.000Z",
    price: 2000.0,
    currency: "INR",
    billing: "Monthly",
    renewalDate: "2026-06-27T10:00:00.000Z",
    color: "#b8d4e3",
  },
  {
    id: "canva-pro",
    icon: icons.canva,
    name: "Canva Pro",
    plan: "Yearly Access",
    category: "Design",
    paymentMethod: "Visa ending in 7784",
    status: "cancelled",
    startDate: "2024-04-02T10:00:00.000Z",
    price: 119.99,
    currency: "INR",
    billing: "Yearly",
    renewalDate: "2026-04-02T10:00:00.000Z",
    color: "#b8e8d0",
  },
];

export const CHART_DATA = [
  { day: "Mon", value: 36, active: false },
  { day: "Tue", value: 32, active: false },
  { day: "Wed", value: 24, active: false },
  { day: "Thr", value: 42, active: true },
  { day: "Fri", value: 35, active: false },
  { day: "Sat", value: 22, active: false },
  { day: "Sun", value: 24, active: false },
];

export const INSIGHTS_EXPENSES = {
  amount: 424.63,
  currency: "INR", // Changed from USD to INR
  date: "March 2026",
  growth: "+12%",
};

export const INSIGHTS_HISTORY: Subscription[] = [
  {
    id: "claude-pro-insight",
    icon: icons.claude,
    name: "Claude",
    plan: "",
    category: "AI Tools",
    paymentMethod: "",
    status: "active",
    startDate: "2025-06-25T12:00:00.000Z",
    price: 9.84,
    currency: "INR",
    billing: "per month",
    renewalDate: "2026-06-25T12:00:00.000Z", // Using June 25, 12:00
    color: "#f5c542", // Yellow
  },
  {
    id: "canva-pro-insight",
    icon: icons.canva,
    name: "Canva",
    plan: "",
    category: "Design",
    paymentMethod: "",
    status: "active",
    startDate: "2025-06-30T16:00:00.000Z",
    price: 43.89,
    currency: "INR",
    billing: "per month",
    renewalDate: "2026-06-30T16:00:00.000Z", // June 30, 16:00
    color: "#8fd1bd", // Mint from the theme
  },
];
