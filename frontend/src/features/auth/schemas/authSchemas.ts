import { z } from "zod";

export const loginSchema = z.object({
  login: z
    .string()
    .min(1, "Enter your email or username"),

  password: z
    .string()
    .min(1, "Enter your password"),

  rememberMe: z.boolean(),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Enter your first name"),

    lastName: z
      .string()
      .min(1, "Enter your last name"),

    middleName: z.string(),

    phoneNumber: z
      .string()
      .min(1, "Enter your phone number")
      .min(5, "Phone number is too short"),

    email: z
      .string()
      .min(1, "Enter your email address")
      .email("Enter a valid email address"),

    password: z
      .string()
      .min(1, "Enter your password")
      .min(8, "Password must contain at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    confirmPassword: z.string().min(1, "Confirm your password"),

    acceptTerms: z.boolean().refine((value) => value, {
      message: "You must agree to the Terms of Use",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
