import z from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password must be at most 100 characters long"),
  avatar: z.string().url("Avatar must be a valid URL").optional(),
  age: z
    .number()
    .int("Age must be an integer")
    .positive("Age must be a positive number")
    .optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  about: z.string().max(500, "About must be at most 500 characters long").optional(),
});

export type SignupDTO = z.infer<typeof signupSchema>;
