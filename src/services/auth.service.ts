import { api } from "@/lib/api/client";
import type { LoginInput, RegisterInput } from "@/lib/schemas/auth.schema";
import type { UpdateProfileInput } from "@/lib/schemas/profile.schema";
import type { AuthResponse, User } from "@/types";

export const authService = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    return api.post<AuthResponse>("/login", data);
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    return api.post<AuthResponse>("/register", data);
  },

  logout: async (): Promise<void> => {
    return api.post<void>("/logout");
  },

  getProfile: async (): Promise<{ user: User }> => {
    return api.get<{ user: User }>("/profile");
  },

  updateProfile: async (
    data: UpdateProfileInput,
  ): Promise<{ user: User; message: string }> => {
    const payload = { ...data };
    if (!payload.password || payload.password === "") {
      delete payload.password;
      delete payload.password_confirmation;
    }
    return api.put<{ user: User; message: string }>("/profile", payload);
  },

  refresh: async (): Promise<AuthResponse> => {
    return api.post<AuthResponse>("/refresh");
  },
};
