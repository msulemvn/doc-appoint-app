import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import {
  initEcho,
  disconnectEcho,
  getOrCreatePrivateChannel,
} from "@/lib/echo";
import { useNotificationStore } from "@/stores/notification.store";
import { toast } from "sonner";
import type { Notification } from "@/stores/notification.store";

type BroadcastNotificationData = {
  id: string;
  type: string;
  message: string;
  status?: string;
  [key: string]: unknown;
};

const shownToastIds = new Set<string>();
let isEchoSetupComplete = false;
let currentSetupUserId: number | null = null;

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
    const isPaymentConfirmed =
      broadcastData.type === "App\\Notifications\\PaymentConfirmedNotification";
    const isCancelled = broadcastData.status === "cancelled";
    const isConfirmed = broadcastData.status === "confirmed";

    if (isAppointmentCreated) {
      toast.success(broadcastData.message as string);
    } else if (isPaymentConfirmed) {
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
  const userId = useAuthStore((state) => state.user?.id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const token = useAuthStore.getState().token;

    if (!isAuthenticated || !token || !userId) {
      if (isEchoSetupComplete) {
        disconnectEcho();
        isEchoSetupComplete = false;
        currentSetupUserId = null;
      }
      return;
    }

    if (isEchoSetupComplete && currentSetupUserId === userId) {
      return;
    }

    if (isEchoSetupComplete && currentSetupUserId !== userId) {
      disconnectEcho();
      isEchoSetupComplete = false;
      currentSetupUserId = null;
    }
    initEcho(token);

    const channelName = `App.Models.User.${userId}`;
    const channel = getOrCreatePrivateChannel(channelName);

    const eventName =
      ".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated";

    channel.listen(eventName, handleNotification);

    isEchoSetupComplete = true;
    currentSetupUserId = userId;

    return () => {
      channel.stopListening(eventName, handleNotification);
    };
  }, [isAuthenticated, userId]);
};
