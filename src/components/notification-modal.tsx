import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { Bell } from "lucide-react";
import { useNotificationStore } from "@/stores/notification.store";
import { useAuthStore } from "@/stores/auth.store";

export function NotificationModal() {
  const { notifications, markAsRead, unreadCount } = useNotificationStore();
  const { user } = useAuthStore();

  const handleMarkAsRead = (id: string | number) => {
    markAsRead(id);
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
          {notifications
            .filter((notification) => notification.userId === user?.id)
            .map((notification) => (
              <div
                key={notification.id}
                className="flex items-start justify-between"
              >
                <p className="text-sm">
                  {notification.data.message && notification.data.message}
                </p>
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
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
