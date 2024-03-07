import * as z from "zod";

export const registerUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
