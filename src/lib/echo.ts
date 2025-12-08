import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { useAuthStore } from "@/stores/auth.store";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any>;
  }
}

window.Pusher = Pusher;
Pusher.logToConsole = import.meta.env.DEV;

export const createEchoInstance = () => {
  const token = useAuthStore.getState().token;

  return new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

export const disconnect = () => {

  if (window.Echo) {

    window.Echo.disconnect();

  }

};
