// Web stub — @stripe/stripe-react-native cannot run on web.
// The checkout modal is never rendered on web (it uses the web
// custom-checkout.tsx instead), so these are safe no-ops.

import React from "react";
import type { ViewStyle } from "react-native";

export const StripeProvider = ({
  children,
}: {
  children: React.ReactNode;
  publishableKey?: string;
  [key: string]: unknown;
}) => children as React.ReactElement;

export const CardField = (_props: {
  onCardChange?: (details: { complete: boolean }) => void;
  style?: ViewStyle;
  cardStyle?: Record<string, unknown>;
  postalCodeEnabled?: boolean;
}) => null;

export const useConfirmPayment = () => ({
  confirmPayment: async (_clientSecret: string, _options: unknown) => ({
    error: { message: "Stripe native not available on web" },
  }),
  loading: false,
});
