import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { useNotificationStore } from "@/stores/notification.store";
import { useAuthStore } from "@/stores/auth.store";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/notification.service";
import { formatRelativeTime } from "@/lib/utils";
import {
  getNotificationRoute,
  getNotificationIcon,
  formatNotificationMessage,
} from "@/lib/notification-utils";
import type { Notification } from "@/stores/notification.store";

export function NotificationModal() {
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const [open, setOpen] = useState(false);

  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read_at) {
      try {
        await markNotificationAsRead(String(notification.id));
        markAsRead(notification.id);
      } catch {
        // Silent fail - don't block navigation
      }
    }

    const route = getNotificationRoute(notification);
    if (route) {
      navigate(route);
      setOpen(false);
    }
  };

  const handleMarkAsReadClick = async (
    e: React.MouseEvent,
    notificationId: string,
  ) => {
    e.stopPropagation();

    try {
      await markNotificationAsRead(String(notificationId));
      markAsRead(notificationId);
    } catch {
      // Silent fail
    }
  };

  const handleMarkAllAsRead = async () => {
    if (isMarkingAllAsRead) return;

    try {
      setIsMarkingAllAsRead(true);
      await markAllNotificationsAsRead();
      markAllAsRead();
    } catch {
      // Silent fail
    } finally {
      setIsMarkingAllAsRead(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white"
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none">Notifications</h4>
            {unreadCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMarkAllAsRead}
                    disabled={isMarkingAllAsRead}
                    aria-label="Mark all as read"
                    className="h-8 w-8"
                  >
                    {isMarkingAllAsRead ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCheck className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mark all as read</TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {unreadCount === 0
              ? "No unread notifications"
              : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
          </p>
        </div>

        <Separator />

        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const NotificationIcon = getNotificationIcon(notification);
              const message = formatNotificationMessage(
                notification,
                user?.role,
              );
              const isUnread = !notification.read_at;

              return (
                <div
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${message}. ${formatRelativeTime(notification.created_at)}. ${isUnread ? "Unread" : "Read"}`}
                  onClick={() => handleNotificationClick(notification)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleNotificationClick(notification);
                    }
                  }}
                  className={`group flex gap-3 p-3 rounded-lg transition-all cursor-pointer hover:bg-accent/50 ${
                    isUnread ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`mt-0.5 ${isUnread ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <NotificationIcon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <p
                        className={`text-sm line-clamp-2 ${isUnread ? "font-semibold" : ""}`}
                      >
                        {message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(notification.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    {isUnread && (
                      <div className="mt-1.5">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                    {isUnread && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) =>
                              handleMarkAsReadClick(e, notification.id)
                            }
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mark as read</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
