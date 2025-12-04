import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { handleApiError } from "@/lib/error-handler";

export function useAuthInit() {
  const { token, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const { user } = await authService.getProfile();
          setAuth(user, token);
        } catch (error) {
          handleApiError(error);
          clearAuth();
        }
      }
    };

    initAuth();
  }, [token, setAuth, clearAuth]);
}
