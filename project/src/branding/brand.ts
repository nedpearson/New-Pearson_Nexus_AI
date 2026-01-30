export const brand = {
  appName: 'Pearson Nexus AI',
  slogan: 'Capture Anything, Organize Everything',

  logos: {
    full: '/brand/pearson_nexus_ai_logo.png',
    emblem: '/brand/pearson_nexus_ai_logo.png',
  },

  usage: {
    full: [
      'Login/Signup screens',
      'Landing/splash screens',
      'Empty states needing brand anchor',
      'Marketing hero sections',
    ],
    emblem: [
      'App sidebar/topbar header',
      'Mobile nav drawer header',
      'Favicon/PWA icons',
      'Compact contexts (cards, toasts)',
    ],
  },

  meta: {
    title: 'Pearson Nexus AI - Capture Anything, Organize Everything',
    description: 'Capture Anything, Organize Everything',
    ogImage: '/brand/pearson_nexus_ai_logo.png',
  },
} as const;
