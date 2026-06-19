"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { can, Role } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

const VALID_ROLES: Role[] = ["ADMIN", "MANAGER", "MEMBER", "VIEWER"];

export async function updateUserRole(userId: string, newRole: Role) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!can(session.user.role as Role, "canManageUsers")) {
    throw new Error("Only admins can manage user roles");
  }

  if (!VALID_ROLES.includes(newRole)) {
    throw new Error("Invalid role");
  }

  // Prevent admin from changing their own role (safety guard)
  if (session.user.id === userId) {
    throw new Error("You cannot change your own role");
  }

  await db.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  revalidatePath("/admin");
  return { success: true };
}
