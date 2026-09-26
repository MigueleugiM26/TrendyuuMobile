import Toast from "react-native-toast-message";

// ─── Setup ────────────────────────────────────────────────────────────────────
// Add <Toast /> to the root of your app (App.tsx / _layout.tsx), as the LAST
// child so it renders above everything else:
//
//   import Toast from "react-native-toast-message";
//   export default function RootLayout() {
//     return (
//       <>
//         <YourApp />
//         <Toast />
//       </>
//     );
//   }

type Position = "top" | "bottom";

const DEFAULT_POSITION: Position = "top";

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface ShowOptions {
  title: string;
  description?: string;
  position?: Position;
  duration?: number;
  type: "success" | "error" | "info";
}

function show({ type, title, description, position, duration }: ShowOptions) {
  Toast.show({
    type,
    text1: title,
    text2: description,
    position: position ?? DEFAULT_POSITION,
    visibilityTime: duration ?? 4000,
  });
}

// ─── Public API (same names as the web version) ───────────────────────────────

export const toastSuccess = (
  title: string,
  description?: string,
  position?: Position,
) => show({ type: "success", title, description, position });

export const toastError = (
  title: string,
  description?: string,
  position?: Position,
) => show({ type: "error", title, description, position });

export const toastWarning = (
  title: string,
  description?: string,
  position?: Position,
) =>
  // react-native-toast-message doesn't have a built-in "warning" type.
  // Using "info" here; you can register a custom "warning" type if needed:
  // https://github.com/calintamas/react-native-toast-message#custom-toast-types
  show({ type: "info", title, description, position });

export const toastInfo = (
  title: string,
  description?: string,
  position?: Position,
) => show({ type: "info", title, description, position });

export const toastMessage = (
  title: string,
  description?: string,
  position?: Position,
  duration = 5000,
) => show({ type: "info", title, description, position, duration });

export const toastLoading = (
  title: string,
  description?: string,
  position?: Position,
) =>
  // react-native-toast-message doesn't have a loading spinner type built-in.
  // Show an info toast; swap for a custom type with a spinner if you need one.
  show({ type: "info", title, description, position, duration: 999999 });

export const toastPromise = async <T>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string },
  position?: Position,
): Promise<T> => {
  show({ type: "info", title: messages.loading, position, duration: 999999 });
  try {
    const result = await promise;
    Toast.hide();
    show({ type: "success", title: messages.success, position });
    return result;
  } catch (err) {
    Toast.hide();
    show({ type: "error", title: messages.error, position });
    throw err;
  }
};

export const toastDismiss = () => Toast.hide();
