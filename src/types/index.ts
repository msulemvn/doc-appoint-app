import { type LucideProps } from "lucide-react";
import { type ComponentType } from "react";
import type Echo from "laravel-echo";
import type { Channel } from "pusher-js";

export type { Echo, Channel };

export interface Patient {
  id: number;
  user_id: number;
  name?: string;
  email?: string;
  phone: string | null;
  date_of_birth: string | null;
  created_at?: string;
  updated_at?: string;
  user?: User;
}

export interface Doctor {
  id: number;
  user_id: number;
  name?: string;
  email?: string | null;
  phone: string | null;
  specialization: string | null;
  license_number: string | null;
  years_of_experience: number | null;
  consultation_fee: string | number | null;
  bio: string | null;
  created_at?: string;
  updated_at?: string;
  user?: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: "patient" | "doctor";
  email_verified_at?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface NavItem {
  title: string;
  href: string | { url: string };
  icon?: string | ComponentType<LucideProps>;
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

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export type AppointmentStatus =
  | "pending"
  | "awaiting_payment"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface Appointment {
  id: number;
  appointment_date: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  doctor?: Doctor;
  patient?: Patient;
}

export interface CreateAppointmentInput {
  doctor_id: number;
  appointment_date: string;
  notes?: string;
}

export interface UpdateAppointmentStatusInput {
  status: "awaiting_payment" | "confirmed" | "cancelled" | "completed";
}

export interface AppointmentStatusUpdatedEvent {
  appointment: Appointment;
  user: User;
}

export interface ChatListItem {
  id: number;
  uuid: string;
  user1?: User;
  user2?: User;
  users?: User[];
  last_message?: Message;
  unread_count?: number;
  status: "active" | "closed";
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: number;
  uuid: string;
  user1: User;
  user2: User;
  last_message?: Message;
  last_message_id?: number;
  messages: Message[];
  status: "active" | "closed";
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  chat_id: number;
  user_id: number;
  content: string;
  file?: string;
  file_url?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
  sender: User;
}

export interface SendMessagePayload {
  chat_id: number;
  message: string;
  file?: File;
}

export interface ITimeSlot {
  time: string;
  is_available: boolean;
}
