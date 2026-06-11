"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

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
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Validate password length
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Sign up error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
