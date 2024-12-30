export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export const MODE = import.meta.env.MODE;

export const LAUNCH_DARKLY_CLIENT_SIDE_ID = import.meta.env.VITE_LAUNCH_DARKLY_CLIENT_SIDE_ID;

export const HUBSPOT_PORTAL_ID = import.meta.env.VITE_HUBSPOT_EMBED;

export const IS_EE_AUTH_ENABLED = import.meta.env.VITE_IS_EE_AUTH_ENABLED === 'true';

export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

export const APP_ID = import.meta.env.VITE_NOVU_APP_ID || '';

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

export const API_HOSTNAME = import.meta.env.VITE_API_HOSTNAME;

export const INTERCOM_APP_ID = import.meta.env.VITE_INTERCOM_APP_ID;

export const SEGMENT_KEY = import.meta.env.VITE_SEGMENT_KEY;

export const MIXPANEL_KEY = import.meta.env.VITE_MIXPANEL_KEY;
