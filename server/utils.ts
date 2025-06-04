import bcrypt from 'bcryptjs';
import { Request } from "express";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getUserFromSession(req: Request) {
  const userId = (req as any).user?.id;
  if (!userId) return null;

  const result = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] || null;
} 