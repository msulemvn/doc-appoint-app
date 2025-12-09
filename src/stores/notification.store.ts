import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Notification = {
  id: string;
  notifiable_id: number;
  notifiable_type: string;
  type: string;
  data: { message: string; [key: string]: unknown };
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string | number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  setNotifications: (notifications: Notification[]) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      addNotification: (notification) =>
        set((state) => {
          const exists = state.notifications.some(
            (notif) => notif.id === notification.id,
          );
          if (exists) {
            return state;
          }
          const newNotifications = [notification, ...state.notifications];
          return {
            notifications: newNotifications,
            unreadCount: state.unreadCount + 1,
          };
        }),
      markAsRead: (id) =>
        set((state) => {
          const updatedNotifications = state.notifications.map((notif) =>
            notif.id === id && !notif.read_at
              ? { ...notif, read_at: new Date().toISOString() }
              : notif,
          );
          const newUnreadCount = updatedNotifications.filter(
            (notif) => !notif.read_at,
          ).length;
          return {
            notifications: updatedNotifications,
            unreadCount: newUnreadCount,
          };
        }),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.read_at
              ? notif
              : { ...notif, read_at: new Date().toISOString() },
          ),
          unreadCount: 0,
        })),
      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
      setNotifications: (notifications) =>
        set(() => {
          const unreadCount = notifications.filter(
            (notif) => !notif.read_at,
          ).length;
          return { notifications, unreadCount };
        }),
    }),
    {
      name: "notifications-storage",
    },
  ),
);
