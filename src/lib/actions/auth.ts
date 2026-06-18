"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signUpSchema } from "@/lib/validations/auth";

interface SignUpResult {
  success: boolean;
  error?: string;
}

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<SignUpResult> {
  try {
    // Validate input
    const validated = signUpSchema.parse({ name, email, password });

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validated.password, 12);

    // Create the user
    await db.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Sign up error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
