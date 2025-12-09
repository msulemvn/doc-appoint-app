import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { Bell } from "lucide-react";
import { useNotificationStore } from "@/stores/notification.store";
import { useAuthStore } from "@/stores/auth.store";
import { markNotificationAsRead } from "@/services/notification.service";

export function NotificationModal() {
  const { notifications, markAsRead, unreadCount } = useNotificationStore();
  const { user } = useAuthStore();

  const handleMarkAsRead = async (id: string | number) => {
    try {
      await markNotificationAsRead(String(id));
      markAsRead(id);
    } catch (_error) {}
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Notifications</h4>
          <p className="text-sm text-muted-foreground">
            You have {unreadCount} unread notifications.
          </p>
        </div>
        <div className="mt-4 space-y-4 max-h-60 overflow-y-auto">
          {notifications.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No notifications yet
            </p>
          )}
          {notifications
            .filter((notification) => notification.notifiable_id === user?.id)
            .map((notification) => {
              const getNotificationMessage = () => {
                const typeMap: Record<string, string> = {
                  "App\\Notifications\\AppointmentCreatedNotification":
                    "appointment.created",
                  "App\\Notifications\\AppointmentStatusUpdatedNotification":
                    "appointment.status.updated",
                  "App\\Notifications\\MessageSentNotification": "message.sent",
                };

                const notificationType =
                  typeMap[notification.type] || notification.type;

                if (notification.data.message) {
                  return notification.data.message as string;
                }

                if (notificationType === "message.sent") {
                  const data = notification.data as {
                    sender_name?: string;
                    content?: string;
                    file?: string;
                  };
                  const messageText = data.content
                    ? data.content
                    : data.file
                      ? "📎 Sent an attachment"
                      : "New message";
                  return `New message from ${data.sender_name}: ${messageText}`;
                }

                if (notificationType === "appointment.created") {
                  const data = notification.data as {
                    patient_name?: string;
                    doctor_name?: string;
                  };
                  return user?.role === "patient"
                    ? `New appointment scheduled with Dr. ${data.doctor_name}`
                    : `New appointment request from ${data.patient_name}`;
                }

                if (notificationType === "appointment.status.updated") {
                  const data = notification.data as {
                    patient_name?: string;
                    doctor_name?: string;
                    status?: string;
                  };
                  return user?.role === "patient"
                    ? `Appointment with Dr. ${data.doctor_name} is now ${data.status}`
                    : `Appointment with ${data.patient_name} is now ${data.status}`;
                }

                return "New notification";
              };

              return (
                <div
                  key={notification.id}
                  className="flex items-start justify-between gap-2"
                >
                  <p className="text-sm flex-1">{getNotificationMessage()}</p>
                  {!notification.read_at && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              );
            })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
