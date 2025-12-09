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
        const mappedNotifications = notifications.map((notif) => ({
          id: notif.id,
          userId: user.id,
          type: notif.type,
          data: notif.data,
          read_at: notif.read_at,
          created_at: notif.created_at,
          updated_at: notif.updated_at,
        }));
        setNotifications(mappedNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, [isAuthenticated, user, setNotifications]);
};
