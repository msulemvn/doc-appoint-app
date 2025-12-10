import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { getNotifications } from "@/services/notification.service";

export const useNotifications = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications,
  );

  useEffect(() => {
    if (!user || !isAuthenticated) {
      return;
    }

    const fetchNotifications = async () => {
      try {
        const notifications = await getNotifications();
        setNotifications(notifications);
      } catch (_error) {
        // TODO: Handle error
      }
    };

    fetchNotifications();
  }, [user, isAuthenticated, setNotifications]);
};
