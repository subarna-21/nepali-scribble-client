import * as z from "zod";

export const registerUserSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(4, "Too short")
    .max(50, "Too long"),
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email address" }),
  dob: z.date({ required_error: "Date is required" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" }),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
