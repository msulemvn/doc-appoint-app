import { Link } from "react-router-dom";
import { getChats } from "@/services/chat.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChatAvatar } from "@/components/ui/chat-avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect, useState } from "react";
import type { ChatListItem, User, Message } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { MessageCircle } from "lucide-react";
import { getEchoInstance } from "@/lib/echo";
import { Channel } from "laravel-echo";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Chats",
    href: "/chats",
  },
];

export default function ChatsPage() {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const data = await getChats();
        setChats(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load chats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (!user?.id || chats.length === 0) return;

    const echo = getEchoInstance();
    if (!echo) return;

    const listeners: Array<() => void> = [];

    chats.forEach((chat) => {
      if (!chat.id) return;

      const channel: Channel = echo.private(`chats.${chat.id}`);

      const messageSentCallback = (e: { message: Message }) => {
        const newMessage = e.message;

        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id === chat.id) {
              const isOwnMessage = newMessage.user_id === user.id;
              return {
                ...c,
                last_message: newMessage,
                unread_count: isOwnMessage
                  ? c.unread_count
                  : (c.unread_count || 0) + 1,
              };
            }
            return c;
          }),
        );
      };

      channel.listen(".message.sent", messageSentCallback);

      listeners.push(() => {
        channel.stopListening(".message.sent", messageSentCallback);
      });
    });

    return () => {
      listeners.forEach((cleanup) => cleanup());
    };
  }, [chats, user?.id]);

  const getOtherUser = (chat: ChatListItem): User | undefined => {
    if (chat.users && Array.isArray(chat.users)) {
      return chat.users.find((u) => u.id !== user?.id);
    }
    if (chat.user1 && chat.user2) {
      return chat.user1.id === user?.id ? chat.user2 : chat.user1;
    }
    return undefined;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Card>
        <CardHeader>
          <CardTitle>Chats</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <div>Loading...</div>}
          {error && <div className="text-destructive">{error}</div>}
          <div className="space-y-4">
            {!isLoading && !error && chats.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
                <div className="text-center">
                  <h3 className="font-semibold">No chats found</h3>
                  <p className="text-sm text-muted-foreground">No active chats found.</p>
                </div>
              </div>
            )}
            {!isLoading &&
              !error &&
              chats.map((chat) => {
                const otherUser = getOtherUser(chat);
                if (!otherUser) {
                  return null;
                }
                const hasUnread = (chat.unread_count ?? 0) > 0;
                return (
                  <Link
                    key={chat.uuid}
                    to={`/chats/${chat.uuid}`}
                    className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted transition-colors relative"
                  >
                    <div className="relative">
                      <ChatAvatar user={otherUser} />
                      {hasUnread && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className={hasUnread ? "font-bold" : "font-semibold"}
                        >
                          {otherUser.name}
                        </h3>
                        {hasUnread && (
                          <Badge
                            variant="default"
                            className="h-5 min-w-5 px-1.5"
                          >
                            {chat.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-sm truncate ${hasUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}
                      >
                        {chat.last_message?.content || (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            Start a conversation
                          </span>
                        )}
                      </p>
                    </div>
                  </Link>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
