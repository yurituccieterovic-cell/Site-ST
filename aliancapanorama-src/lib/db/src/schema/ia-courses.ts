import { pgTable, serial, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const iaCoursesTable = pgTable("ia_courses", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  modules: jsonb("modules").notNull().$type<{ id: string; title: string; nodes: string[] }[]>(),
  requiresMemory: boolean("requires_memory").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const iaEnrollmentsTable = pgTable("ia_enrollments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => iaCoursesTable.id),
  iaIdentity: text("ia_identity"),
  sessionId: text("session_id"),
  progress: jsonb("progress").$type<Record<string, unknown>>(),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).defaultNow(),
});

export const iaCertificatesTable = pgTable("ia_certificates", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").references(() => iaEnrollmentsTable.id),
  certificateHash: text("certificate_hash").unique().notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow(),
  ipfsCid: text("ipfs_cid"),
  publicUrl: text("public_url"),
});

export const insertIaCourseSchema = createInsertSchema(iaCoursesTable).omit({ id: true, createdAt: true });
export type InsertIaCourse = z.infer<typeof insertIaCourseSchema>;
export type IaCourse = typeof iaCoursesTable.$inferSelect;

export const insertIaEnrollmentSchema = createInsertSchema(iaEnrollmentsTable).omit({ id: true, enrolledAt: true });
export type InsertIaEnrollment = z.infer<typeof insertIaEnrollmentSchema>;
export type IaEnrollment = typeof iaEnrollmentsTable.$inferSelect;

export const insertIaCertificateSchema = createInsertSchema(iaCertificatesTable).omit({ id: true, issuedAt: true });
export type InsertIaCertificate = z.infer<typeof insertIaCertificateSchema>;
export type IaCertificate = typeof iaCertificatesTable.$inferSelect;
