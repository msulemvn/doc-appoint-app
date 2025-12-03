import { api } from "@/lib/api/client";
import type { Doctor } from "@/types";

export interface DoctorWithUser extends Doctor {
  user?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

export const doctorService = {
  getAvailableDoctors: async (): Promise<{ doctors: DoctorWithUser[] }> => {
    const data = await api.get<DoctorWithUser[]>("/doctors/available");
    return { doctors: data };
  },

  getDoctorById: async (id: number): Promise<{ doctor: DoctorWithUser }> => {
    const data = await api.get<DoctorWithUser>(`/doctors/${id}`);
    return { doctor: data };
  },
};
