import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    date_of_birth: z.string().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
    password_confirmation: z
      .string()
      .min(8, "Password confirmation is required")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.password_confirmation) {
        return data.password === data.password_confirmation;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["password_confirmation"],
    },
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
