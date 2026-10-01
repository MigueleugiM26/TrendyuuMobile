import React from "react";

const client = {
  capture: (_event: string, _props?: Record<string, unknown>) => {},
  identify: (_id: string, _props?: Record<string, unknown>) => {},
  alias: (_alias: string) => {},
  reset: () => {},
  optIn: () => {},
  optOut: () => {},
  screen: (_name: string, _props?: Record<string, unknown>) => {},
  group: (_type: string, _key: string, _props?: Record<string, unknown>) => {},
  isFeatureEnabled: (_key: string) => false as boolean,
  getFeatureFlag: (_key: string) => undefined,
  getFeatureFlagPayload: (_key: string) => undefined,
  reloadFeatureFlags: () => Promise.resolve(),
};

// Named exports
export const usePostHog = () => client;

export const PostHogProvider = ({
  children,
}: {
  children: React.ReactNode;
  apiKey?: string;
  options?: Record<string, unknown>;
}) => React.createElement(React.Fragment, null, children);

export const useFeatureFlag = (_key: string) => undefined;
export const useActiveFeatureFlags = () => [] as string[];

// Default export (for `import posthog from "posthog-react-native"`)
export default client;
