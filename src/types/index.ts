import { type LucideIcon } from "lucide-react";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface NavItem {
  title: string;
  href: string | { url: string };
  icon?: LucideIcon;
}

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface SharedData {
  auth: {
    user: User;
  };
  sidebarOpen: boolean;
}
