import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<"reverb"> | null;
  }
}

window.Pusher = Pusher;
Pusher.logToConsole = import.meta.env.DEV;

let echoInstance: Echo<"reverb"> | null = null;
let currentToken: string | null = null;

const _createEchoInstance = (token: string): Echo<"reverb"> => {
  const echoConfig = {
    broadcaster: "reverb" as const,
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === "https",
    enabledTransports: ["ws", "wss"] as ("ws" | "wss")[],
    enableStats: false,
    authEndpoint: `${import.meta.env.VITE_APP_URL}/api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  };

  const echo = new Echo(echoConfig);
  return echo;
};

export const initEcho = (token: string | null) => {
  if (!token) {
    if (echoInstance) {
      echoInstance.disconnect();
      echoInstance = null;
      window.Echo = null;
      currentToken = null;
    }
    return;
  }

  if (echoInstance && currentToken === token) {
    return;
  }

  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    window.Echo = null;
  }

  echoInstance = _createEchoInstance(token);
  window.Echo = echoInstance;
  currentToken = token;
};

export const getEchoInstance = (): Echo<"reverb"> | null => {
  return echoInstance;
};

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    window.Echo = null;
    currentToken = null;
  }
};

export const getOrCreatePrivateChannel = (channelName: string) => {
  const echo = getEchoInstance();
  if (!echo) {
    throw new Error("Echo instance not initialized");
  }

  const privateChannelName = `private-${channelName}`;
  let channel = echo.connector.channels[privateChannelName];

  if (!channel) {
    channel = echo.private(channelName);
  }

  return channel;
};
