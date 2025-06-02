import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("public"), // public, health_worker, registrar, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Birth registrations table
export const birthRegistrations = pgTable("birth_registrations", {
  id: serial("id").primaryKey(),
  applicationId: varchar("application_id").notNull().unique(),
  certificateId: varchar("certificate_id").unique(),
  
  // Child information
  childFirstName: varchar("child_first_name").notNull(),
  childLastName: varchar("child_last_name").notNull(),
  childSex: varchar("child_sex").notNull(),
  birthDate: timestamp("birth_date").notNull(),
  birthPlace: text("birth_place").notNull(),
  
  // Parent information
  fatherName: varchar("father_name").notNull(),
  fatherNationalId: varchar("father_national_id").notNull(),
  motherName: varchar("mother_name").notNull(),
  motherNationalId: varchar("mother_national_id").notNull(),
  
  // System fields
  submittedBy: varchar("submitted_by").notNull(), // user ID
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  rejectionReason: text("rejection_reason"),
  approvedBy: varchar("approved_by"), // registrar user ID
  approvedAt: timestamp("approved_at"),
  
  // File uploads
  hospitalCertificateUrl: text("hospital_certificate_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Death registrations table
export const deathRegistrations = pgTable("death_registrations", {
  id: serial("id").primaryKey(),
  applicationId: varchar("application_id").notNull().unique(),
  certificateId: varchar("certificate_id").unique(),
  
  // Deceased information
  deceasedName: varchar("deceased_name").notNull(),
  deathDate: timestamp("death_date").notNull(),
  deathPlace: text("death_place").notNull(),
  causeOfDeath: text("cause_of_death").notNull(),
  
  // Next of kin information
  kinName: varchar("kin_name").notNull(),
  kinRelationship: varchar("kin_relationship").notNull(),
  kinPhone: varchar("kin_phone").notNull(),
  kinNationalId: varchar("kin_national_id"),
  
  // System fields
  submittedBy: varchar("submitted_by").notNull(), // user ID
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  rejectionReason: text("rejection_reason"),
  approvedBy: varchar("approved_by"), // registrar user ID
  approvedAt: timestamp("approved_at"),
  
  // File uploads
  medicalCertificateUrl: text("medical_certificate_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  birthRegistrations: many(birthRegistrations),
  deathRegistrations: many(deathRegistrations),
}));

export const birthRegistrationsRelations = relations(birthRegistrations, ({ one }) => ({
  submitter: one(users, {
    fields: [birthRegistrations.submittedBy],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [birthRegistrations.approvedBy],
    references: [users.id],
  }),
}));

export const deathRegistrationsRelations = relations(deathRegistrations, ({ one }) => ({
  submitter: one(users, {
    fields: [deathRegistrations.submittedBy],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [deathRegistrations.approvedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertBirthRegistrationSchema = createInsertSchema(birthRegistrations).omit({
  id: true,
  applicationId: true,
  certificateId: true,
  submittedBy: true,
  status: true,
  approvedBy: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  birthDate: z.coerce.date(),
});

export const insertDeathRegistrationSchema = createInsertSchema(deathRegistrations).omit({
  id: true,
  applicationId: true,
  certificateId: true,
  submittedBy: true,
  status: true,
  approvedBy: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  deathDate: z.coerce.date(),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type BirthRegistration = typeof birthRegistrations.$inferSelect;
export type InsertBirthRegistration = z.infer<typeof insertBirthRegistrationSchema>;
export type DeathRegistration = typeof deathRegistrations.$inferSelect;
export type InsertDeathRegistration = z.infer<typeof insertDeathRegistrationSchema>;
