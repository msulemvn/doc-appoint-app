import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { handleApiError } from "@/lib/error-handler";

export function useAuthInit() {
  const { token, setAuth, clearAuth } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      if (token && !initialized.current) {
        try {
          const { user } = await authService.getProfile();
          setAuth(user, token);
        } catch (error) {
          handleApiError(error);
          clearAuth();
        } finally {
          initialized.current = true;
        }
      }
    };

    initAuth();
  }, [token, setAuth, clearAuth]);
}
