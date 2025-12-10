import { api } from "@/lib/api/client";

export interface CreatePaymentIntentInput {
  appointment_id: number;
}

export interface PaymentIntentResponse {
  clientSecret: string;
}

export interface ConfirmPaymentInput {
  payment_intent: string;
  appointment_id: number;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
}

export const paymentService = {
  createPaymentIntent: async (
    data: CreatePaymentIntentInput,
  ): Promise<PaymentIntentResponse> => {
    const response = await api.post<PaymentIntentResponse>(
      "/payments/intent",
      data,
    );
    return response;
  },

  confirmPayment: async (
    data: ConfirmPaymentInput,
  ): Promise<ConfirmPaymentResponse> => {
    const response = await api.post<ConfirmPaymentResponse>(
      "/payments/confirm",
      data,
    );
    return response;
  },
};
