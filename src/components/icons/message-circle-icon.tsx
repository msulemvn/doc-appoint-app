import { MessageCircle } from "lucide-react";
import { type LucideIcon } from "lucide-react";

import { Icon, type IconProps } from "@/components/icon";

export const MessageCircleIcon = ({
  ...props
}: Omit<IconProps, "iconNode">) => (
  <Icon iconNode={MessageCircle as LucideIcon} {...props} />
);

export default MessageCircleIcon;
