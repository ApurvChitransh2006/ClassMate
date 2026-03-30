import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/result/[testId]
// Students  → their own latest attempt + per-question breakdown
// Teachers/Admins → all students' attempts for this test

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testId } = await params;

    // 🔹 Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🔹 Get test + chapter → subject → classroom for permission check
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: { options: true },
        },
        chapter: {
          include: {
            subject: {
              select: { teacherId: true, classroomId: true },
            },
          },
        },
      },
    });
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // 🔹 Check membership
    const membership = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: user.id,
          classroomId: test.chapter.subject.classroomId,
        },
      },
      select: { role: true },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isAdmin = membership.role === "ADMIN";
    const isTeacher = test.chapter.subject.teacherId === user.id;
    const isPrivileged = isAdmin || isTeacher;

    // ── TEACHER / ADMIN: return all attempts ──────────────────────────────
    if (isPrivileged) {
      const allAttempts = await prisma.attempt.findMany({
        where: { testId: testId },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          answers: {
            include: {
              question: { select: { id: true, text: true } },
              option: { select: { id: true, text: true, isCorrect: true } },
            },
          },
        },
      });

      const attempts = allAttempts.map((attempt) => {
        const correct = attempt.answers.filter((a) => a.option.isCorrect).length;
        return {
          attemptId: attempt.id,
          submittedAt: attempt.createdAt,
          student: attempt.user,
          score: attempt.score,
          totalMarks: test.totalMarks,
          correct,
          total: test.questions.length,
          percentage: Math.round((correct / test.questions.length) * 100),
          answers: attempt.answers.map((a) => ({
            questionId: a.questionId,
            questionText: a.question.text,
            chosenOptionId: a.optionId,
            chosenOptionText: a.option.text,
            isCorrect: a.option.isCorrect,
          })),
        };
      });

      return NextResponse.json({
        testId: test.id,
        title: test.title,
        totalMarks: test.totalMarks,
        duration: test.duration,
        startTime: test.startTime,
        endTime: test.endTime,
        totalAttempts: attempts.length,
        attempts,
      });
    }

    // ── STUDENT: return their own latest attempt ───────────────────────────
    const attempt = await prisma.attempt.findFirst({
      where: { testId: testId, userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        answers: {
          include: {
            question: { select: { id: true, text: true } },
            option: { select: { id: true, text: true, isCorrect: true } },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "No attempt found" }, { status: 404 });
    }

    // Build per-question breakdown with correct answer revealed
    const questionMap = new Map(test.questions.map((q) => [q.id, q]));

    const breakdown = attempt.answers.map((a) => {
      const question = questionMap.get(a.questionId)!;
      const correctOption = question.options.find((o) => o.isCorrect);
      return {
        questionId: a.questionId,
        questionText: a.question.text,
        chosenOptionId: a.optionId,
        chosenOptionText: a.option.text,
        isCorrect: a.option.isCorrect,
        correctOptionId: correctOption?.id ?? null,
        correctOptionText: correctOption?.text ?? null,
      };
    });

    const correct = breakdown.filter((b) => b.isCorrect).length;

    return NextResponse.json({
      testId: test.id,
      title: test.title,
      description: test.description,
      totalMarks: test.totalMarks,
      duration: test.duration,
      attemptId: attempt.id,
      submittedAt: attempt.createdAt,
      score: attempt.score,
      correct,
      total: test.questions.length,
      percentage: Math.round((correct / test.questions.length) * 100),
      breakdown,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch result" }, { status: 500 });
  }
}