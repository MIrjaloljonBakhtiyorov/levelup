import { z } from "zod";

export const loginSchema = z.object({
  login: z
    .string()
    .min(1, "Loginni kiriting"),

  password: z
    .string()
    .min(1, "Parolingizni kiriting"),

  rememberMe: z.boolean(),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Ismingizni kiriting"),

    lastName: z
      .string()
      .min(1, "Familiyangizni kiriting"),

    middleName: z.string(),

    phoneNumber: z
      .string()
      .min(1, "Telefon raqamingizni kiriting")
      .min(5, "Telefon raqam juda qisqa"),

    email: z
      .string()
      .min(1, "Email manzilingizni kiriting")
      .email("To‘g‘ri email manzil kiriting"),

    password: z
      .string()
      .min(1, "Parolingizni kiriting")
      .min(8, "Parol kamida 8 ta belgidan iborat bo‘lishi kerak")
      .regex(/[A-Z]/, "Parolda kamida bitta katta harf bo‘lishi kerak")
      .regex(/[0-9]/, "Parolda kamida bitta raqam bo‘lishi kerak"),

    confirmPassword: z.string().min(1, "Parolni tasdiqlang"),

    acceptTerms: z.boolean().refine((value) => value, {
      message: "Foydalanish shartlariga rozilik berishingiz kerak",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parollar mos kelmadi",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
