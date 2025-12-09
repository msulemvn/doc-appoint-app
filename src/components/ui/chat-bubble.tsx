import { cn } from "@/lib/utils";
import type { Message } from "@/types";
import { ChatAvatar } from "./chat-avatar";
import { useAuthStore } from "@/stores/auth.store";
import { Check, CheckCheck, FileText, Download } from "lucide-react";

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const { user } = useAuthStore();

  const isCurrentUser = message.sender && message.sender.id === user?.id;
  const isRead = !!message.read_at;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className={cn(
        "flex items-end gap-2 group",
        isCurrentUser ? "justify-end" : "justify-start",
      )}
    >
      {!isCurrentUser && (
        <ChatAvatar user={message.sender} className="h-8 w-8 text-xs" />
      )}
      <div className="flex flex-col gap-1 max-w-xs">
        {!isCurrentUser && (
          <span className="text-xs text-muted-foreground px-2">
            {message.sender.name}
          </span>
        )}
        <div
          className={cn(
            "rounded-lg p-3 text-sm shadow-sm transition-all",
            isCurrentUser
              ? "rounded-br-none bg-primary text-primary-foreground"
              : cn(
                  "rounded-bl-none bg-muted",
                  !isRead && !isCurrentUser && "ring-2 ring-primary/20",
                ),
          )}
        >
          {message.content && <p className="break-words">{message.content}</p>}
          {message.file_url && (
            <a
              href={message.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-2 mt-2 p-2 rounded border transition-colors",
                isCurrentUser
                  ? "border-primary-foreground/20 hover:bg-primary-foreground/10"
                  : "border-border hover:bg-muted",
              )}
            >
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs truncate flex-1">
                {message.file?.split("/").pop() || "Attachment"}
              </span>
              <Download className="h-3 w-3 flex-shrink-0" />
            </a>
          )}
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-xs opacity-70",
              isCurrentUser ? "justify-end" : "justify-start",
            )}
          >
            <span>{formatTime(message.created_at)}</span>
            {isCurrentUser &&
              (isRead ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              ))}
          </div>
        </div>
      </div>
      {isCurrentUser && (
        <ChatAvatar user={message.sender} className="h-8 w-8 text-xs" />
      )}
    </div>
  );
}
