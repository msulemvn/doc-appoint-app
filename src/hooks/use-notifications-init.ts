import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { getNotifications } from "@/services/notification.service";

export const useNotificationsInit = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications,
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated || !user) return;

      try {
        const notifications = await getNotifications();
        setNotifications(notifications);
      } catch (_error) {}
    };

    fetchNotifications();
  }, [isAuthenticated, user, setNotifications]);
};
