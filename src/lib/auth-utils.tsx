import { EventEmitter } from "eventemitter3";

// ─── Auth event bus (replaces window.dispatchEvent) ───────────────────────────
// Subscribe to these events anywhere in the app:
//
//   import { authEvents } from "@/lib/auth-utils";
//
//   useEffect(() => {
//     authEvents.on("userLoggedIn", refetchUser);
//     authEvents.on("userLoggedOut", clearUser);
//     return () => {
//       authEvents.off("userLoggedIn", refetchUser);
//       authEvents.off("userLoggedOut", clearUser);
//     };
//   }, []);

export const authEvents = new EventEmitter();

export const notifyLoginSuccess = () => authEvents.emit("userLoggedIn");
export const notifyLogout = () => authEvents.emit("userLoggedOut");
export const forceUserRefresh = () => authEvents.emit("userLoggedIn");
