import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const admissionsTable = pgTable("admissions", {
  id: serial("id").primaryKey(),
  studentFullName: text("student_full_name").notNull(),
  fathersName: text("fathers_name").notNull(),
  guardianName: text("guardian_name"),
  guardianRelationship: text("guardian_relationship").notNull(),
  studentGender: text("student_gender").notNull(),
  studentAge: integer("student_age").notNull(),
  country: text("country").notNull(),
  stateProvince: text("state_province").notNull(),
  guardianWhatsapp: text("guardian_whatsapp").notNull(),
  studentWhatsapp: text("student_whatsapp"),
  emailAddress: text("email_address"),
  course: text("course").notNull(),
  darsENizamiYear: integer("dars_e_nizami_year"),
  classFormat: text("class_format").notNull(),
  preferredDuration: text("preferred_duration"),
  preferredTeacherGender: text("preferred_teacher_gender").notNull(),
  currentLevel: text("current_level"),
  preferredTime1: text("preferred_time1"),
  preferredTime2: text("preferred_time2"),
  timezone: text("timezone").notNull(),
  daysAvailable: text("days_available").notNull(),
  specialNeeds: text("special_needs"),
  additionalNotes: text("additional_notes"),
  howDidYouHear: text("how_did_you_hear"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdmissionSchema = createInsertSchema(admissionsTable).omit({ id: true, createdAt: true });
export type InsertAdmission = z.infer<typeof insertAdmissionSchema>;
export type Admission = typeof admissionsTable.$inferSelect;
