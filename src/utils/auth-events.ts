// utils/auth-events.ts
//
// Replaces the web `window.dispatchEvent(new CustomEvent("userLoggedIn"))` pattern.
// Call `authEvents.emit("userLoggedIn")` after OAuth / token storage,
// and the UserProvider will pick it up and re-fetch the user.
//
// Usage (after storing tokens):
//   import { authEvents } from "@/utils/auth-events";
//   authEvents.emit("userLoggedIn");

type AuthEventName = "userLoggedIn" | "userLoggedOut";
type Listener = () => void;

class AuthEventEmitter {
  private listeners: Map<AuthEventName, Set<Listener>> = new Map();

  on(event: AuthEventName, listener: Listener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Return an unsubscribe function
    return () => this.off(event, listener);
  }

  off(event: AuthEventName, listener: Listener): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit(event: AuthEventName): void {
    this.listeners.get(event)?.forEach((listener) => listener());
  }
}

// Singleton — import this wherever you need to trigger or listen to auth events.
export const authEvents = new AuthEventEmitter();
