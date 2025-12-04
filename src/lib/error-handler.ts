import { toast } from "sonner";
import { ApiError } from "./api/client";

export function handleApiError(
  error: unknown,
  setFieldError?: (name: string, error: { message: string }) => void,
) {
  if (error instanceof ApiError) {
    const { message, errors } = error;

    toast.error(message);

    if (errors && setFieldError) {
      Object.entries(errors).forEach(([field, messages]) => {
        setFieldError(field, { message: messages.join(", ") });
      });
    }
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error("An unexpected error occurred");
  }
}
