import * as z from "zod";

export const registerUserSchema = z
  .object({
    name: z
      .string({ required_error: "Name is required" })
      .min(4, "Too short")
      .max(50, "Too long"),
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" }),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters" }),
    cpassword: z.string({ required_error: "Confirm Password is required" }),
  })
  .strict()
  .refine((data) => data.password === data.cpassword, {
    message: "Passwords do not match",
    path: ["cpassword"],
  });

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
