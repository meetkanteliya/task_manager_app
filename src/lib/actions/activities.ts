"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function getActivities(limit: number = 20) {
  const user = await requireAuth();

  const activities = await db.activity.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return activities;
}

export async function clearActivities() {
  const user = await requireAuth();

  await db.activity.deleteMany({
    where: { userId: user.id },
  });

  return { success: true };
}
