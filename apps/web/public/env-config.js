window._env_ = Object.assign(
  {
    SKIP_PREFLIGHT_CHECK: 'true',
    VITE_ENVIRONMENT: 'dev',
    IS_IMPROVED_ONBOARDING_ENABLED: 'false',
  },
  // Allow overrides of the above defaults
  window._env_
);
