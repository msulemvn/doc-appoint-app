import { useEffect, useCallback } from "react";
import { getEchoInstance } from "@/lib/echo";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { toast } from "sonner";
import type { Appointment, Message, Chat, User } from "@/types";
import type { Notification } from "@/stores/notification.store";
import { api } from "@/lib/api/client";

interface AppointmentEvent {
  appointment: Appointment;
}

interface MessageSentEvent {
  message: Message;
  chat: Chat;
  sender: User;
}

const getDisplayName = (
  entity: Appointment["doctor"] | Appointment["patient"],
) => {
  if (!entity) return "Unknown";
  return entity.user?.name || entity.name || "Unknown";
};

export const useNotifications = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  useEffect(() => {
    if (!user || !isAuthenticated) {
      return;
    }

    const echo = getEchoInstance();
    if (!echo) {
      return;
    }

    const fetchLatestNotification = async () => {
      try {
        const fetchedNotifications =
          await api.get<Notification[]>("/notifications");

        if (fetchedNotifications.length > 0) {
          const latestNotification = fetchedNotifications[0];
          addNotification(latestNotification);
        }
      } catch (_error) {}
    };

    const channelName = `users.${user.id}`;
    const channel = echo.private(channelName);

    const handleAppointmentCreated = (event: AppointmentEvent) => {
      const appointment = event.appointment;
      const isPatient = user.role === "patient";
      const doctorName = appointment.doctor
        ? getDisplayName(appointment.doctor)
        : "Unknown Doctor";
      const patientName = appointment.patient
        ? getDisplayName(appointment.patient)
        : "Unknown Patient";
      const message = isPatient
        ? `New appointment scheduled with Dr. ${doctorName}`
        : `New appointment request from ${patientName}`;
      toast.success(message);
      fetchLatestNotification();
    };

    const handleAppointmentStatusUpdated = (event: AppointmentEvent) => {
      const appointment = event.appointment;
      const isPatient = user.role === "patient";
      const doctorName = getDisplayName(appointment.doctor);
      const patientName = getDisplayName(appointment.patient);
      const message = isPatient
        ? `Appointment with Dr. ${doctorName} is now ${appointment.status}`
        : `Appointment with ${patientName} is now ${appointment.status}`;

      if (appointment.status === "cancelled") {
        toast.warning(message);
      } else {
        toast.info(message);
      }
      fetchLatestNotification();
    };

    const handleMessageSent = (event: MessageSentEvent) => {
      const { message, sender } = event;

      if (!message || message.sender.id === user.id) {
        return;
      }

      const messageText = message.content
        ? message.content
        : message.file
          ? "📎 Sent an attachment"
          : "New message";
      const toastMessage = `New message from ${sender.name}: ${messageText}`;
      toast.info(toastMessage);
      fetchLatestNotification();
    };

    channel
      .listen(".appointment.created", handleAppointmentCreated)
      .listen(".appointment.status.updated", handleAppointmentStatusUpdated)
      .listen(".message.sent", handleMessageSent);

    return () => {
      channel
        .stopListening(".appointment.created", handleAppointmentCreated)
        .stopListening(
          ".appointment.status.updated",
          handleAppointmentStatusUpdated,
        )
        .stopListening(".message.sent", handleMessageSent);
      echo.leave(channelName);
    };
  }, [user, isAuthenticated, addNotification]);
};
