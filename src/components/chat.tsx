import { Channel } from "laravel-echo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useRef, useState, useCallback } from "react";

import {
  getMessages,
  sendMessage,
  markMessageAsRead,
} from "@/services/chat.service";
import { MessageInput } from "./message-input";
import { ChatBubble } from "./ui/chat-bubble";
import { useAuthStore } from "@/stores/auth.store";
import { type Chat, type Message } from "@/types";
import { getEchoInstance } from "@/lib/echo";

const schema = z
  .object({
    message: z.string(),
    file: z.any().optional(),
  })
  .refine(
    (data) =>
      (data.message && data.message.trim().length > 0) || data.file?.[0],
    {
      message: "Either a message or a file is required",
      path: ["message"],
    },
  );

interface ChatProps {
  chat: Chat;
}

export function ChatBox({ chat: initialChat }: ChatProps) {
  const { user } = useAuthStore();

  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);

  const fetchMessages = useCallback(async () => {
    if (!initialChat?.uuid) return;

    setIsLoadingMessages(true);

    try {
      const fetchedMessages = await getMessages(initialChat.uuid);

      if (Array.isArray(fetchedMessages)) {
        setMessages(fetchedMessages.reverse());
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [initialChat.uuid]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!user || messages.length === 0) return;

    const unreadMessages = messages.filter(
      (msg) => msg.user_id !== user.id && !msg.read_at,
    );

    if (unreadMessages.length > 0) {
      unreadMessages.forEach(async (msg) => {
        try {
          await markMessageAsRead(msg.id);
          setMessages((prevMessages) =>
            prevMessages.map((m) =>
              m.id === msg.id ? { ...m, read_at: new Date().toISOString() } : m,
            ),
          );
        } catch {
          return;
        }
      });
    }
  }, [messages.length, user, messages]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: "",
      file: null,
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setIsSendingMessage(true);
    try {
      if (!initialChat?.uuid) {
        return;
      }

      if (initialChat.status === "closed") {
        alert("This chat is closed. No new messages can be sent.");
        return;
      }

      const newMessage = await sendMessage(
        initialChat.uuid,
        values.message || "",
        values.file?.[0],
      );

      setMessages((prevMessages) => [...prevMessages, newMessage]);

      form.reset();
    } catch {
      return;
    } finally {
      setIsSendingMessage(false);
    }
  };

  useEffect(() => {
    if (!initialChat?.id) return;

    const echo = getEchoInstance();

    if (!echo) return;

    const channel: Channel = echo.private(`chats.${initialChat.id}`);

    const messageSentCallback = async (e: { message: Message }) => {
      const newMessage = e.message;
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some(
          (msg) => msg.id === newMessage.id,
        );
        if (messageExists) {
          return prevMessages;
        }
        return [...prevMessages, newMessage];
      });

      if (user && newMessage.user_id !== user.id && !newMessage.read_at) {
        try {
          await markMessageAsRead(newMessage.id);
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === newMessage.id
                ? { ...msg, read_at: new Date().toISOString() }
                : msg,
            ),
          );
        } catch {
          return;
        }
      }
    };

    channel.listen(".message.sent", messageSentCallback);

    return () => {
      channel.stopListening(".message.sent", messageSentCallback);
    };
  }, [initialChat?.id, user]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-[70vh] flex-col">
      <div
        className="flex-1 space-y-4 overflow-y-auto p-4"
        ref={messagesContainerRef}
      >
        {isLoadingMessages && <div>Loading messages...</div>}
        {!isLoadingMessages &&
          messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
      </div>
      {initialChat.status === "closed" && (
        <div className="border-t bg-muted/50 p-3 text-center text-sm text-muted-foreground">
          This chat has been closed. No new messages can be sent.
        </div>
      )}
      <div className="border-t p-4">
        <MessageInput
          form={form}
          onSubmit={onSubmit}
          isLoading={isSendingMessage}
          disabled={initialChat.status === "closed"}
        />
      </div>
    </div>
  );
}
