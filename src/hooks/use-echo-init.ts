import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { createEchoInstance, disconnect } from "@/lib/echo";

export const useEchoInit = () => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      window.Echo = createEchoInstance();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated]);
};
