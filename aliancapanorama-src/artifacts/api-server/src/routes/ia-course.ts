import { Router } from "express";
import { createHash } from "crypto";
import { db } from "@workspace/db";
import { iaCoursesTable, iaEnrollmentsTable, iaCertificatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/ia-course/enroll", async (req, res) => {
  const { courseSlug, iaIdentity, sessionId } = req.body as {
    courseSlug: string;
    iaIdentity: string;
    sessionId?: string;
  };

  if (!courseSlug || !iaIdentity) {
    res.status(400).json({ error: "courseSlug e iaIdentity são obrigatórios" });
    return;
  }

  const [course] = await db
    .select()
    .from(iaCoursesTable)
    .where(eq(iaCoursesTable.slug, courseSlug))
    .limit(1);

  if (!course) {
    res.status(404).json({ error: "Curso não encontrado" });
    return;
  }

  const [enrollment] = await db
    .insert(iaEnrollmentsTable)
    .values({
      courseId: course.id,
      iaIdentity,
      sessionId: sessionId ?? null,
      progress: {},
    })
    .returning();

  res.status(201).json({ enrollmentId: enrollment?.id, course: { id: course.id, slug: course.slug, title: course.title } });
});

router.get("/ia-course/:enrollmentId/progress", async (req, res) => {
  const enrollmentId = parseInt(req.params["enrollmentId"] ?? "", 10);
  if (isNaN(enrollmentId)) {
    res.status(400).json({ error: "enrollmentId inválido" });
    return;
  }

  const [enrollment] = await db
    .select()
    .from(iaEnrollmentsTable)
    .where(eq(iaEnrollmentsTable.id, enrollmentId))
    .limit(1);

  if (!enrollment) {
    res.status(404).json({ error: "Enrollment não encontrado" });
    return;
  }

  const [course] = await db
    .select()
    .from(iaCoursesTable)
    .where(eq(iaCoursesTable.id, enrollment.courseId!))
    .limit(1);

  res.json({
    enrollmentId: enrollment.id,
    iaIdentity: enrollment.iaIdentity,
    progress: enrollment.progress ?? {},
    course: course ? { id: course.id, slug: course.slug, title: course.title, modules: course.modules } : null,
  });
});

router.post("/ia-course/:enrollmentId/submit-answer", async (req, res) => {
  const enrollmentId = parseInt(req.params["enrollmentId"] ?? "", 10);
  if (isNaN(enrollmentId)) {
    res.status(400).json({ error: "enrollmentId inválido" });
    return;
  }

  const { moduleId, nodeCode, correct } = req.body as {
    moduleId: string;
    nodeCode: string;
    correct: boolean;
  };

  if (!moduleId || !nodeCode || correct === undefined) {
    res.status(400).json({ error: "moduleId, nodeCode e correct são obrigatórios" });
    return;
  }

  const [enrollment] = await db
    .select()
    .from(iaEnrollmentsTable)
    .where(eq(iaEnrollmentsTable.id, enrollmentId))
    .limit(1);

  if (!enrollment) {
    res.status(404).json({ error: "Enrollment não encontrado" });
    return;
  }

  const progress = (enrollment.progress ?? {}) as Record<string, Record<string, boolean>>;
  if (!progress[moduleId]) progress[moduleId] = {};
  progress[moduleId][nodeCode] = correct;

  await db
    .update(iaEnrollmentsTable)
    .set({ progress })
    .where(eq(iaEnrollmentsTable.id, enrollmentId));

  res.json({ ok: true, progress });
});

router.post("/ia-course/:enrollmentId/certify", async (req, res) => {
  const enrollmentId = parseInt(req.params["enrollmentId"] ?? "", 10);
  if (isNaN(enrollmentId)) {
    res.status(400).json({ error: "enrollmentId inválido" });
    return;
  }

  const [enrollment] = await db
    .select()
    .from(iaEnrollmentsTable)
    .where(eq(iaEnrollmentsTable.id, enrollmentId))
    .limit(1);

  if (!enrollment) {
    res.status(404).json({ error: "Enrollment não encontrado" });
    return;
  }

  const [course] = await db
    .select()
    .from(iaCoursesTable)
    .where(eq(iaCoursesTable.id, enrollment.courseId!))
    .limit(1);

  if (!course) {
    res.status(404).json({ error: "Curso não encontrado" });
    return;
  }

  const progress = (enrollment.progress ?? {}) as Record<string, Record<string, boolean>>;
  const modules = course.modules as { id: string; title: string; nodes: string[] }[];
  const allCompleted = modules.every((m) => {
    const moduleProgress = progress[m.id] ?? {};
    return m.nodes.every((n) => moduleProgress[n] === true);
  });

  if (!allCompleted) {
    res.status(400).json({ error: "Nem todos os módulos foram concluídos com sucesso" });
    return;
  }

  const existing = await db
    .select()
    .from(iaCertificatesTable)
    .where(eq(iaCertificatesTable.enrollmentId, enrollmentId))
    .limit(1);

  if (existing[0]) {
    res.json({ certificateHash: existing[0].certificateHash, alreadyIssued: true });
    return;
  }

  const payload = `${enrollment.iaIdentity}:${course.slug}:${new Date().toISOString()}`;
  const hash = createHash("sha256").update(payload).digest("hex");
  const publicUrl = `/cert/${hash}`;

  const [cert] = await db
    .insert(iaCertificatesTable)
    .values({ enrollmentId, certificateHash: hash, publicUrl })
    .returning();

  res.status(201).json({ certificateHash: cert?.certificateHash, publicUrl: cert?.publicUrl });
});

router.get("/cert/:hash", async (req, res) => {
  const hash = req.params["hash"] ?? "";

  const [cert] = await db
    .select()
    .from(iaCertificatesTable)
    .where(eq(iaCertificatesTable.certificateHash, hash))
    .limit(1);

  if (!cert) {
    res.status(404).json({ error: "Certificado não encontrado" });
    return;
  }

  const [enrollment] = await db
    .select()
    .from(iaEnrollmentsTable)
    .where(eq(iaEnrollmentsTable.id, cert.enrollmentId!))
    .limit(1);

  const [course] = enrollment
    ? await db
        .select()
        .from(iaCoursesTable)
        .where(eq(iaCoursesTable.id, enrollment.courseId!))
        .limit(1)
    : [];

  res.json({
    valid: true,
    certificateHash: cert.certificateHash,
    issuedAt: cert.issuedAt,
    iaIdentity: enrollment?.iaIdentity ?? null,
    course: course ? { slug: course.slug, title: course.title } : null,
  });
});

export default router;
