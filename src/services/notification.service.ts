import { api } from "@/lib/api/client";
import type { Notification } from "@/stores/notification.store";

export async function getNotifications(): Promise<Notification[]> {
  const res = await api.get<Notification[]>("/notifications");
  return res;
}

export async function getUnreadCount(): Promise<number> {
  const res = await api.get<{ count: number }>("/notifications/unread-count");
  return res.count;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await api.post("/notifications/mark-all-read");
}
