import {
  users,
  birthRegistrations,
  deathRegistrations,
  type User,
  type UpsertUser,
  type BirthRegistration,
  type InsertBirthRegistration,
  type DeathRegistration,
  type InsertDeathRegistration,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, count, gte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Birth registration operations
  createBirthRegistration(data: InsertBirthRegistration, submittedBy: string): Promise<BirthRegistration>;
  getBirthRegistration(id: number): Promise<BirthRegistration | undefined>;
  getBirthRegistrationByApplicationId(applicationId: string): Promise<BirthRegistration | undefined>;
  getBirthRegistrationByCertificateId(certificateId: string): Promise<BirthRegistration | undefined>;
  updateBirthRegistrationStatus(id: number, status: string, approvedBy?: string, rejectionReason?: string): Promise<void>;
  getPendingBirthRegistrations(): Promise<BirthRegistration[]>;
  getBirthRegistrationsByUser(userId: string): Promise<BirthRegistration[]>;
  
  // Death registration operations
  createDeathRegistration(data: InsertDeathRegistration, submittedBy: string): Promise<DeathRegistration>;
  getDeathRegistration(id: number): Promise<DeathRegistration | undefined>;
  getDeathRegistrationByApplicationId(applicationId: string): Promise<DeathRegistration | undefined>;
  getDeathRegistrationByCertificateId(certificateId: string): Promise<DeathRegistration | undefined>;
  updateDeathRegistrationStatus(id: number, status: string, approvedBy?: string, rejectionReason?: string): Promise<void>;
  getPendingDeathRegistrations(): Promise<DeathRegistration[]>;
  getDeathRegistrationsByUser(userId: string): Promise<DeathRegistration[]>;
  
  // Analytics
  getRegistrationStats(): Promise<{
    pendingBirth: number;
    pendingDeath: number;
    approvedThisMonth: number;
    totalRegistrations: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Birth registration operations
  async createBirthRegistration(data: InsertBirthRegistration, submittedBy: string): Promise<BirthRegistration> {
    const applicationId = `BR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const [registration] = await db
      .insert(birthRegistrations)
      .values({
        ...data,
        applicationId,
        submittedBy,
      })
      .returning();
    
    return registration;
  }

  async getBirthRegistration(id: number): Promise<BirthRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(birthRegistrations)
      .where(eq(birthRegistrations.id, id));
    return registration;
  }

  async getBirthRegistrationByApplicationId(applicationId: string): Promise<BirthRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(birthRegistrations)
      .where(eq(birthRegistrations.applicationId, applicationId));
    return registration;
  }

  async getBirthRegistrationByCertificateId(certificateId: string): Promise<BirthRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(birthRegistrations)
      .where(eq(birthRegistrations.certificateId, certificateId));
    return registration;
  }

  async updateBirthRegistrationStatus(
    id: number, 
    status: string, 
    approvedBy?: string, 
    rejectionReason?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === "approved" && approvedBy) {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = new Date();
      updateData.certificateId = `BC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    }

    if (status === "rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    await db
      .update(birthRegistrations)
      .set(updateData)
      .where(eq(birthRegistrations.id, id));
  }

  async getPendingBirthRegistrations(): Promise<BirthRegistration[]> {
    return await db
      .select()
      .from(birthRegistrations)
      .where(eq(birthRegistrations.status, "pending"))
      .orderBy(desc(birthRegistrations.createdAt));
  }

  async getBirthRegistrationsByUser(userId: string): Promise<BirthRegistration[]> {
    return await db
      .select()
      .from(birthRegistrations)
      .where(eq(birthRegistrations.submittedBy, userId))
      .orderBy(desc(birthRegistrations.createdAt));
  }

  // Death registration operations
  async createDeathRegistration(data: InsertDeathRegistration, submittedBy: string): Promise<DeathRegistration> {
    const applicationId = `DR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const [registration] = await db
      .insert(deathRegistrations)
      .values({
        ...data,
        applicationId,
        submittedBy,
      })
      .returning();
    
    return registration;
  }

  async getDeathRegistration(id: number): Promise<DeathRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(deathRegistrations)
      .where(eq(deathRegistrations.id, id));
    return registration;
  }

  async getDeathRegistrationByApplicationId(applicationId: string): Promise<DeathRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(deathRegistrations)
      .where(eq(deathRegistrations.applicationId, applicationId));
    return registration;
  }

  async getDeathRegistrationByCertificateId(certificateId: string): Promise<DeathRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(deathRegistrations)
      .where(eq(deathRegistrations.certificateId, certificateId));
    return registration;
  }

  async updateDeathRegistrationStatus(
    id: number, 
    status: string, 
    approvedBy?: string, 
    rejectionReason?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === "approved" && approvedBy) {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = new Date();
      updateData.certificateId = `DC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    }

    if (status === "rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    await db
      .update(deathRegistrations)
      .set(updateData)
      .where(eq(deathRegistrations.id, id));
  }

  async getPendingDeathRegistrations(): Promise<DeathRegistration[]> {
    return await db
      .select()
      .from(deathRegistrations)
      .where(eq(deathRegistrations.status, "pending"))
      .orderBy(desc(deathRegistrations.createdAt));
  }

  async getDeathRegistrationsByUser(userId: string): Promise<DeathRegistration[]> {
    return await db
      .select()
      .from(deathRegistrations)
      .where(eq(deathRegistrations.submittedBy, userId))
      .orderBy(desc(deathRegistrations.createdAt));
  }

  // Analytics
  async getRegistrationStats(): Promise<{
    pendingBirth: number;
    pendingDeath: number;
    approvedThisMonth: number;
    totalRegistrations: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [pendingBirthResult] = await db
      .select({ count: count(birthRegistrations.id) })
      .from(birthRegistrations)
      .where(eq(birthRegistrations.status, "pending"));

    const [pendingDeathResult] = await db
      .select({ count: count(deathRegistrations.id) })
      .from(deathRegistrations)
      .where(eq(deathRegistrations.status, "pending"));

    const [approvedBirthResult] = await db
      .select({ count: count(birthRegistrations.id) })
      .from(birthRegistrations)
      .where(and(
        eq(birthRegistrations.status, "approved"),
        gte(birthRegistrations.approvedAt, startOfMonth)
      ));

    const [approvedDeathResult] = await db
      .select({ count: count(deathRegistrations.id) })
      .from(deathRegistrations)
      .where(and(
        eq(deathRegistrations.status, "approved"),
        gte(deathRegistrations.approvedAt, startOfMonth)
      ));

    const [totalBirthResult] = await db
      .select({ count: count(birthRegistrations.id) })
      .from(birthRegistrations);

    const [totalDeathResult] = await db
      .select({ count: count(deathRegistrations.id) })
      .from(deathRegistrations);

    return {
      pendingBirth: Number(pendingBirthResult?.count || 0),
      pendingDeath: Number(pendingDeathResult?.count || 0),
      approvedThisMonth: Number(approvedBirthResult?.count || 0) + Number(approvedDeathResult?.count || 0),
      totalRegistrations: Number(totalBirthResult?.count || 0) + Number(totalDeathResult?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();
