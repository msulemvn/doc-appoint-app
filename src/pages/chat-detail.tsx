import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getChat } from "@/services/chat.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


import { ChatBox } from "@/components/chat";
import { useAuthStore } from "@/stores/auth.store";
import { ChatAvatar } from "@/components/ui/chat-avatar";
import type { Chat, User } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

export default function ChatDetailPage() {
  const { id: uuid } = useParams<{ id: string }>();

  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();

  const getOtherUser = (currentChat: Chat): User | null => {
    if (!user?.id || (!currentChat.user1 && !currentChat.user2)) {

      return null;
    }

    if (currentChat.user1 && currentChat.user1.id !== user.id) {
      return currentChat.user1;
    }
    if (currentChat.user2 && currentChat.user2.id !== user.id) {
      return currentChat.user2;
    }

    return null;
  };

  const otherUser = chat ? getOtherUser(chat) : null;

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: "Chats",
      href: "/chats",
    },
    {
      title: otherUser?.name || "Chat Detail",
      href: `/chats/${uuid}`,
    },
  ];

  useEffect(() => {
    const fetchChatDetail = async () => {
      if (!uuid) return;
      try {
        setIsLoading(true);
        const data = await getChat(uuid);
        setChat(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load chat");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatDetail();
  }, [uuid]);



  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            {otherUser && <ChatAvatar user={otherUser} />}
            <div>
              <CardTitle>{otherUser?.name}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <div>Loading...</div>}
          {error && <div className="text-destructive">{error}</div>}
          {chat && <ChatBox chat={chat} />}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
