import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { initEcho, disconnectEcho, getEchoInstance } from "@/lib/echo";
import { useNotificationStore } from "@/stores/notification.store";
import { toast } from "sonner";
import type { Notification } from "@/stores/notification.store";
import { Channel } from "laravel-echo";

type BroadcastNotificationData = {
  id: string;
  type: string;
  message: string;
  status?: string;
  [key: string]: unknown;
};

const shownToastIds = new Set<string>();
let notificationChannel: Channel | null = null;

const handleNotification = (broadcastData: BroadcastNotificationData) => {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return;

  const notification: Notification = {
    id: broadcastData.id,
    notifiable_id: userId,
    notifiable_type: "App\\Models\\User",
    type: broadcastData.type,
    data: broadcastData,
    read_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  useNotificationStore.getState().addNotification(notification);

  if (broadcastData.message && !shownToastIds.has(broadcastData.id)) {
    shownToastIds.add(broadcastData.id);

    const isAppointmentCreated =
      broadcastData.type ===
      "App\\Notifications\\AppointmentCreatedNotification";
    const isAppointmentStatusUpdated =
      broadcastData.type ===
      "App\\Notifications\\AppointmentStatusUpdatedNotification";
    const isCancelled = broadcastData.status === "cancelled";
    const isConfirmed = broadcastData.status === "confirmed";

    if (isAppointmentCreated) {
      toast.success(broadcastData.message as string);
    } else if (isAppointmentStatusUpdated && isConfirmed) {
      toast.success(broadcastData.message as string);
    } else if (isAppointmentStatusUpdated && isCancelled) {
      toast.warning(broadcastData.message as string);
    } else {
      toast.info(broadcastData.message as string);
    }
  }
};

export const useEchoSetup = () => {
  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.user?.id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setupCompleteRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token || !userId) {
      if (notificationChannel) {
        notificationChannel = null;
      }
      disconnectEcho();
      setupCompleteRef.current = false;
      return;
    }

    if (setupCompleteRef.current) {
      return;
    }

    initEcho(token);
    const echo = getEchoInstance();
    if (!echo) {
      return;
    }

    const channelName = `App.Models.User.${userId}`;
    notificationChannel = echo.private(channelName);
    notificationChannel.listen(
      ".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
      handleNotification,
    );

    setupCompleteRef.current = true;
  }, [isAuthenticated, token, userId]);
};
