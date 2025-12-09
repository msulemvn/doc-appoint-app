import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;
Pusher.logToConsole = import.meta.env.DEV;

let echoInstance: Echo<Pusher> | null = null;

const _createEchoInstance = (token: string) => {
  return new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === "https",
    enabledTransports: ["ws", "wss"],
    enableStats: false,
    authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

export const initEcho = (token: string | null) => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }

  if (token) {
    echoInstance = _createEchoInstance(token);
  }
};

export const getEchoInstance = (): Echo<Pusher> | null => {
  return echoInstance;
};

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
};
