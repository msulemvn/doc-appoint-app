import { Calendar, MessageCircle, CreditCard, Bell, type LucideIcon } from "lucide-react";
import type { Notification } from "@/stores/notification.store";

export function getNotificationRoute(
  notification: Notification,
): string | null {
  const { type, data } = notification;

  if (type.includes("Appointment") || type.includes("Payment")) {
    return data.appointment_id
      ? `/appointments/${data.appointment_id}`
      : "/appointments";
  }

  if (type.includes("Message")) {
    return data.chat_uuid ? `/chats/${data.chat_uuid}` : "/chats";
  }

  return null;
}

export function getNotificationIcon(notification: Notification): LucideIcon {
  switch (true) {
    case notification.type.includes("Payment"):
      return CreditCard;
    case notification.type.includes("Appointment"):
      return Calendar;
    case notification.type.includes("Message"):
      return MessageCircle;
    default:
      return Bell;
  }
}

export function formatNotificationMessage(
  notification: Notification,
  userRole?: "patient" | "doctor",
): string {
  if (notification.data.message) {
    return notification.data.message as string;
  }

  const data = notification.data;

  if (notification.type.includes("MessageSent")) {
    const senderName = data.sender_name || "Someone";
    if (data.file) {
      return `New Message - ${senderName} sent you an attachment`;
    }
    if (data.content) {
      const preview =
        typeof data.content === "string" && data.content.length > 50
          ? `${data.content.substring(0, 50)}...`
          : data.content;
      return `New Message - ${senderName}: ${preview}`;
    }
    return `New Message - ${senderName} sent you a message`;
  }

  if (notification.type.includes("AppointmentCreated")) {
    if (userRole === "patient") {
      const doctorName = data.doctor_name || "a doctor";
      return `Appointment Scheduled - You have a new appointment with Dr. ${doctorName}`;
    } else {
      const patientName = data.patient_name || "a patient";
      return `New Appointment Request - ${patientName} has requested an appointment`;
    }
  }

  if (notification.type.includes("AppointmentStatusUpdated")) {
    const status = (data.status as string) || "updated";
    const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);

    if (userRole === "patient") {
      const doctorName = data.doctor_name || "the doctor";
      return `Appointment ${statusCapitalized} - Your appointment with Dr. ${doctorName} has been ${status}`;
    } else {
      const patientName = data.patient_name || "the patient";
      return `Appointment ${statusCapitalized} - Appointment with ${patientName} has been ${status}`;
    }
  }

  return "New notification";
}
