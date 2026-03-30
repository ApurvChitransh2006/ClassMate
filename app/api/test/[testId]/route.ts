// api/test/[testId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/test/[testId]  — fetch test with questions for the test-taking page
// ⚠️  isCorrect is intentionally EXCLUDED from options so students can't cheat

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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const test = await prisma.test.findUnique({
      where: { id:testId },
      include: {
        chapter: {
          include: {
            subject: { select: { classroomId: true } },
          },
        },
        questions: {
          include: {
            options: {
              select: { id: true, text: true }, // ⚠️ NO isCorrect
            },
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Must be a member of the classroom
    const membership = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: user.id,
          classroomId: test.chapter.subject.classroomId,
        },
      },
    });
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Return test without isCorrect
    return NextResponse.json({
      id: test.id,
      title: test.title,
      description: test.description,
      duration: test.duration,
      totalMarks: test.totalMarks,
      startTime: test.startTime,
      endTime: test.endTime,
      questions: test.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options, // only id + text
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch test" }, { status: 500 });
  }
}

// DELETE /api/test/[testId]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testId } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        chapter: {
          include: { subject: { select: { teacherId: true, classroomId: true } } },
        },
      },
    });
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const membership = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: user.id,
          classroomId: test.chapter.subject.classroomId,
        },
      },
      select: { role: true },
    });

    const isAdmin = membership?.role === "ADMIN";
    const isTeacher = test.chapter.subject.teacherId === user.id;
    if (!isAdmin && !isTeacher) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.test.delete({ where: { id:testId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete test" }, { status: 500 });
  }
}