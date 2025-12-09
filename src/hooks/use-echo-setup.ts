import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { initEcho, disconnectEcho } from "@/lib/echo";

export const useEchoSetup = () => {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && token) {
      initEcho(token);
    } else {
      disconnectEcho();
    }

    const unsubscribe = useAuthStore.subscribe((state) => {
      const newToken = state.token;
      if (state.isAuthenticated && newToken) {
        initEcho(newToken);
      } else {
        disconnectEcho();
      }
    });

    return () => {
      unsubscribe();
      disconnectEcho();
    };
  }, [isAuthenticated, token]);
};
