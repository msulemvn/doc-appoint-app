import { api } from "@/lib/api/client";
import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentInput,
  UpdateAppointmentStatusInput,
} from "@/types";

interface ApiResponse<T> {
  message: string;
  statusCode: number;
  status: string;
  data: T;
}

export const appointmentService = {
  getAppointments: async (
    status?: AppointmentStatus,
  ): Promise<Appointment[]> => {
    const params = status ? `?status=${status}` : "";
    const response = await api.get<ApiResponse<Appointment[]>>(
      `/appointments${params}`,
    );
    return response.data;
  },

  getAppointmentById: async (id: number): Promise<Appointment> => {
    const response = await api.get<ApiResponse<Appointment>>(
      `/appointments/${id}`,
    );
    return response.data;
  },

  createAppointment: async (
    data: CreateAppointmentInput,
  ): Promise<Appointment> => {
    const response = await api.post<ApiResponse<Appointment>>(
      "/appointments",
      data,
    );
    return response.data;
  },

  updateAppointmentStatus: async (
    id: number,
    data: UpdateAppointmentStatusInput,
  ): Promise<Appointment> => {
    const response = await api.put<ApiResponse<Appointment>>(
      `/appointments/${id}/status`,
      data,
    );
    return response.data;
  },

  doctorConfirmAppointment: async (id: number): Promise<Appointment> => {
    const response = await api.put<ApiResponse<Appointment>>(
      `/appointments/${id}/status`,
      { status: "awaiting_payment" },
    );
    return response.data;
  },
};
