const appJson = require("./app.json");

export default {
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo?.extra || {}),
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
      eas: {
        projectId: "eb3a1e2a-1684-4084-a2f2-54fe1af14cdc",
      },
    },
  },
};
