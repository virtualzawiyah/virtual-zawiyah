import { Router } from "express";
import { db, contactsTable } from "@workspace/db";
import { SubmitContactBody } from "@workspace/api-zod";

const router = Router();

router.post("/contacts", async (req, res) => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    return;
  }

  const data = parsed.data;

  const [row] = await db
    .insert(contactsTable)
    .values({
      name: data.name,
      email: data.email,
      message: data.message,
    })
    .returning({ id: contactsTable.id });

  req.log.info({ id: row.id }, "Contact message submitted");

  res.status(201).json({
    success: true,
    message: "Thank you for your message. We will get back to you soon.",
    id: row.id,
  });
});

export default router;
