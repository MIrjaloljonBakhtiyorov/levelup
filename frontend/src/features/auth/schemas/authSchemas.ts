import { z } from "zod";

export type AuthTranslate = (text: string) => string;

const loginFields = z.object({
  login: z.string(),
  password: z.string(),
  rememberMe: z.boolean(),
});

const registerFields = z.object({
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string(),
  phoneNumber: z.string(),
  email: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
  acceptTerms: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginFields>;
export type RegisterFormData = z.infer<typeof registerFields>;

export function createLoginSchema(t: AuthTranslate) {
  return z.object({
    login: z.string().min(1, t("Enter your email or username")),
    password: z.string().min(1, t("Enter your password")),
    rememberMe: z.boolean(),
  });
}

export function createRegisterSchema(t: AuthTranslate) {
  return z
    .object({
      firstName: z.string().min(1, t("Enter your first name")),
      lastName: z.string().min(1, t("Enter your last name")),
      middleName: z.string(),
      phoneNumber: z
        .string()
        .min(1, t("Enter your phone number"))
        .min(5, t("Phone number is too short")),
      email: z
        .string()
        .min(1, t("Enter your email address"))
        .email(t("Enter a valid email address")),
      password: z
        .string()
        .min(1, t("Enter your password"))
        .min(8, t("Password must contain at least 8 characters"))
        .regex(/[A-Z]/, t("Password must contain at least one uppercase letter"))
        .regex(/[0-9]/, t("Password must contain at least one number")),
      confirmPassword: z.string().min(1, t("Confirm your password")),
      acceptTerms: z.boolean().refine((value) => value, {
        message: t("You must agree to the Terms of Use"),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("Passwords do not match"),
      path: ["confirmPassword"],
    });
}

// Kept as English defaults for non-React consumers; pages use the factories above.
const identity: AuthTranslate = (text) => text;
export const loginSchema = createLoginSchema(identity);
export const registerSchema = createRegisterSchema(identity);
