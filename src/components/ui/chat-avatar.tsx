import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useAuthStore } from "@/stores/auth.store";
import { useInitials } from "@/hooks/use-initials";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface ChatAvatarProps {
  user: User;
  className?: string;
}

export function ChatAvatar({ user, className }: ChatAvatarProps) {
  if (!user) {
    return null;
  }
  const { user: authUser } = useAuthStore();
  const isCurrentUser = authUser?.id === user.id;

  const getInitials = useInitials();
  const userInitial = getInitials(user.name);

  return (
    <Avatar
      className={cn(
        "flex items-center justify-center",
        isCurrentUser ? "bg-primary" : "bg-muted-foreground",
        className,
      )}
    >
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback>{userInitial}</AvatarFallback>
    </Avatar>
  );
}
