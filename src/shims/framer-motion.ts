import React from "react";
import { View } from "react-native";

const noop = () => {};

// ─── Presence ─────────────────────────────────────────────────────────────────
// moti calls usePresence() from framer-motion

export const PresenceContext = React.createContext<{
  isPresent: boolean;
  onExitComplete?: () => void;
  register?: (id: string) => () => void;
}>({
  isPresent: true,
  onExitComplete: noop,
  register: () => noop,
});

export const usePresence = (): [boolean, (() => void) | null] => [true, null];
export const useIsPresent = (): boolean => true;

// ─── AnimatePresence ──────────────────────────────────────────────────────────

export const AnimatePresence = ({
  children,
}: {
  children?: React.ReactNode;
  initial?: boolean;
  exitBeforeEnter?: boolean;
  onExitComplete?: () => void;
  mode?: string;
}) => React.createElement(React.Fragment, null, children);

// ─── motion.* ─────────────────────────────────────────────────────────────────

export const motion = new Proxy({} as Record<string, any>, {
  get: (_: any, _tag: string) =>
    React.forwardRef(
      (
        {
          children,
          style,
          animate: _a,
          initial: _i,
          exit: _e,
          transition: _t,
          variants: _v,
          whileHover: _wh,
          whileTap: _wt,
          layout: _l,
          ...rest
        }: any,
        ref: any,
      ) => React.createElement(View, { style, ref, ...rest }, children),
    ),
});

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useAnimation = () => ({ start: noop, stop: noop, set: noop });
export const useMotionValue = (initial: any) => ({
  get: () => initial,
  set: noop,
  onChange: () => noop,
});
export const useTransform = (_v: any, _i: any, output: any[]) => ({
  get: () => output?.[0],
  set: noop,
});
export const useSpring = (val: any) => val;
export const useVelocity = () => ({ get: () => 0, set: noop });
export const useInView = () => [null, false] as const;
export const useScroll = () => ({
  scrollY: { get: () => 0, onChange: () => noop },
  scrollX: { get: () => 0, onChange: () => noop },
});
export const useReducedMotion = () => true;
export const useAnimate = () => [null, noop] as const;
export const useDragControls = () => ({});
export const useMotionTemplate = (..._args: any[]) => ({
  get: () => "",
  set: noop,
});
export const useMotionValueEvent = noop;
export const useTime = () => ({ get: () => 0 });
export const useWillChange = () => ({});

// ─── Functions ────────────────────────────────────────────────────────────────

export const animate = noop;
export const animateValue = noop;
export const stagger = () => 0;
export const spring = (opts: any) => opts;
export const inertia = (opts: any) => opts;
export const keyframes = (opts: any) => opts;
export const easeIn = (t: number) => t;
export const easeOut = (t: number) => t;
export const easeInOut = (t: number) => t;
export const circIn = (t: number) => t;
export const circOut = (t: number) => t;
export const circInOut = (t: number) => t;
export const backIn = (t: number) => t;
export const backOut = (t: number) => t;
export const backInOut = (t: number) => t;
export const anticipate = (t: number) => t;
export const cubicBezier = () => (t: number) => t;
export const linear = (t: number) => t;
export const mirrorEasing = (e: any) => e;
export const reverseEasing = (e: any) => e;

// ─── Components ───────────────────────────────────────────────────────────────

export const LayoutGroup = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
export const LazyMotion = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
export const MotionConfig = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
export const Reorder = { Group: LayoutGroup, Item: motion.div };

// ─── Misc ─────────────────────────────────────────────────────────────────────

export const domAnimation = {};
export const domMax = {};
export const sync = { render: noop, read: noop, update: noop };
export const cancelSync = { render: noop, read: noop, update: noop };
export const frameData = { timestamp: 0 };
export const motionValue = (v: any) => ({ get: () => v, set: noop });
export const resolveMotionValue = (v: any) => v;

export default {
  motion,
  AnimatePresence,
  usePresence,
  useIsPresent,
  PresenceContext,
};
