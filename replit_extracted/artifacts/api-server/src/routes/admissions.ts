import { Router } from "express";
import { db, admissionsTable } from "@workspace/db";
import { SubmitAdmissionBody } from "@workspace/api-zod";

const router = Router();

router.post("/admissions", async (req, res) => {
  const parsed = SubmitAdmissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    return;
  }

  const data = parsed.data;

  const [row] = await db
    .insert(admissionsTable)
    .values({
      studentFullName: data.studentFullName,
      fathersName: data.fathersName,
      guardianName: data.guardianName ?? null,
      guardianRelationship: data.guardianRelationship,
      studentGender: data.studentGender,
      studentAge: data.studentAge,
      country: data.country,
      stateProvince: data.stateProvince,
      guardianWhatsapp: data.guardianWhatsapp,
      studentWhatsapp: data.studentWhatsapp ?? null,
      emailAddress: data.emailAddress ?? null,
      course: data.course,
      darsENizamiYear: data.darsENizamiYear ?? null,
      classFormat: data.classFormat,
      preferredDuration: data.preferredDuration ?? null,
      preferredTeacherGender: data.preferredTeacherGender,
      currentLevel: data.currentLevel ?? null,
      preferredTime1: data.preferredTime1 ?? null,
      preferredTime2: data.preferredTime2 ?? null,
      timezone: data.timezone,
      daysAvailable: Array.isArray(data.daysAvailable) ? data.daysAvailable.join(",") : "",
      specialNeeds: data.specialNeeds ?? null,
      additionalNotes: data.additionalNotes ?? null,
      howDidYouHear: data.howDidYouHear ?? null,
    })
    .returning({ id: admissionsTable.id });

  req.log.info({ id: row.id }, "Admission submitted");

  res.status(201).json({
    success: true,
    message: "Your application has been received. Our team will contact you within 24 hours via WhatsApp.",
    id: row.id,
  });
});

export default router;
