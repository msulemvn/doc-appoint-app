import { useEffect } from "react";
import { getEchoInstance } from "@/lib/echo";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { toast } from "sonner";
import type { Appointment, Message, Chat } from "@/types";
import type { Notification } from "@/stores/notification.store";

interface AppointmentEvent {
  appointment: Appointment;
}

interface MessageSentEvent {
  message: Message;
  chat: Chat;
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

    const channelName = `users.${user.id}`;
    const channel = echo.private(channelName);

    channel
      .listen(".appointment.created", (event: AppointmentEvent) => {
        const { appointment } = event;
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

        addNotification({
          id: `appointment-created-${appointment.id}-${Date.now()}`,
          userId: user.id,
          type: "appointment_created",
          data: {
            message,
            appointment_id: appointment.id,
            appointment,
          },
          read_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        toast.success(message);
      })
      .listen(".appointment.status.updated", (event: AppointmentEvent) => {
        const { appointment } = event;
        const isPatient = user.role === "patient";
        const doctorName = getDisplayName(appointment.doctor);
        const patientName = getDisplayName(appointment.patient);
        const message = isPatient
          ? `Appointment with Dr. ${doctorName} is now ${appointment.status}`
          : `Appointment with ${patientName} is now ${appointment.status}`;

        addNotification({
          id: `appointment-updated-${appointment.id}-${Date.now()}`,
          userId: user.id,
          type: "appointment_status_updated",
          data: {
            message,
            appointment_id: appointment.id,
            status: appointment.status,
            appointment,
          },
          read_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (appointment.status === "cancelled") {
          toast.warning(message);
        } else {
          toast.info(message);
        }
      })
      .listen(".message.sent", async (event: MessageSentEvent) => {
        const { message } = event;

        if (!message || message.sender.id === user.id) {
          return;
        }

        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (response.ok) {
            const notifications = await response.json();
            const messageNotification = notifications.find(
              (n: { type: string; data: { message_id?: number } }) =>
                n.type === "App\\Notifications\\MessageSentNotification" &&
                n.data.message_id === message.id
            );

            if (messageNotification) {
              addNotification({
                id: messageNotification.id,
                userId: user.id,
                type: messageNotification.type,
                data: messageNotification.data,
                read_at: messageNotification.read_at,
                created_at: messageNotification.created_at,
                updated_at: messageNotification.updated_at,
              });
            }
          }
        } catch (error) {
          console.error("Failed to fetch notification:", error);
        }
      })
      .listen(".notification.created", (event: { id: string; type: string; data: Record<string, unknown>; created_at: string; updated_at: string; read_at: string | null }) => {
        const notification: Notification = {
          id: event.id,
          userId: user.id,
          type: event.type,
          data: event.data,
          read_at: event.read_at,
          created_at: event.created_at || new Date().toISOString(),
          updated_at: event.updated_at || new Date().toISOString(),
        };

        addNotification(notification);

        if (notification.type !== "App\\Notifications\\MessageSentNotification") {
          const notificationData = notification.data as {
            message?: string;
          };

          if (notificationData.message) {
            toast.info(notificationData.message);
          }
        }
      });

    return () => {
      if (echo) {
        echo.leave(channelName);
      }
    };
  }, [user, isAuthenticated, addNotification]);
};
