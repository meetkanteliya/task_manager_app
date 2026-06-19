"use server";

import { db } from "@/lib/db";

/**
 * If only one user exists in the DB, promote them to ADMIN.
 * This is called after the very first registration + sign-in.
 * Idempotent: does nothing if more than one user exists.
 */
export async function promoteFirstUser() {
  const count = await db.user.count();
  if (count !== 1) return { promoted: false };

  const firstUser = await db.user.findFirst();
  if (!firstUser || firstUser.role === "ADMIN") return { promoted: false };

  await db.user.update({
    where: { id: firstUser.id },
    data: { role: "ADMIN" },
  });

  return { promoted: true };
}
