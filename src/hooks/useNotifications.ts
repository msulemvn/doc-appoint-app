import { useEffect } from "react";
import { createEchoInstance } from "@/lib/echo";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { toast } from "sonner";
import type { Appointment } from "@/types";

interface AppointmentEvent {
  appointment: Appointment;
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

    const echo = createEchoInstance();
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
      });

    return () => {
      echo.leave(channelName);
    };
  }, [user, isAuthenticated, addNotification]);
};
