import { api, apiFormData } from "../lib/api/client";
import type { Chat, ChatListItem, Message } from "../types";

export async function getChats(): Promise<ChatListItem[]> {
  const res = await api.get<ChatListItem[]>("/chats");
  return res;
}

export async function getChat(uuid: string): Promise<Chat> {
  const res = await api.get<Chat>(`/chats/${uuid}`);
  return res;
}

export async function startConversation(
  receiverId: number,
  appointmentId?: number,
): Promise<Chat | null> {
  const res = await api.post<Chat | null>("/chats", {
    receiver_id: receiverId,
    appointment_id: appointmentId,
  });
  if (!res) {
    return null;
  }
  return res;
}

export async function getMessages(uuid: string): Promise<Message[]> {
  const res = await api.get<{ data: Message[] }>(`/chats/${uuid}/messages`);
  return res.data;
}

export async function sendMessage(
  uuid: string,
  content: string,
  file?: File,
): Promise<Message> {
  if (file) {
    const formData = new FormData();
    if (content) {
      formData.append("content", content);
    }
    formData.append("file", file);
    const res = await apiFormData.post<Message>(
      `/chats/${uuid}/messages`,
      formData,
    );
    return res;
  } else {
    const res = await api.post<Message>(`/chats/${uuid}/messages`, { content });
    return res;
  }
}

export async function updateChatStatus(
  uuid: string,
  status: "active" | "closed",
): Promise<Chat> {
  const res = await api.patch<Chat>(`/chats/${uuid}/status`, { status });
  return res;
}

export async function markMessageAsRead(messageId: number): Promise<void> {
  await api.patch(`/messages/${messageId}/read`);
}
