import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";


// ✅ Request Types
type OptionInput = {
  text: string;
  isCorrect: boolean;
};

type QuestionInput = {
  text: string;
  options: OptionInput[];
};

type CreateTestRequest = {
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  chapterId: string;
  startTime: string;
  questions: QuestionInput[];
};


export async function POST(req: Request) {
  try {
    // 🔐 Auth
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Typed body
    const body: CreateTestRequest = await req.json();

    const {
      title,
      description,
      duration,
      totalMarks,
      chapterId,
      startTime,
      questions,
    } = body;

    // ⚠️ Basic validation
    if (!title || !duration || !totalMarks || !chapterId || !startTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔹 Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🔹 Get chapter → subject
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        subject: {
          select: {
            teacherId: true,
            classroomId: true,
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    // 🔹 Permission check
    const membership = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: user.id,
          classroomId: chapter.subject.classroomId,
        },
      },
      select: { role: true },
    });

    const isAdmin = membership?.role === "ADMIN";
    const isTeacher = chapter.subject.teacherId === user.id;

    if (!isAdmin && !isTeacher) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const start = new Date(startTime); 
    const end = new Date(start.getTime() + duration * 60 * 1000);

    // ✅ Strictly typed transformation
    const formattedQuestions: Prisma.QuestionCreateWithoutTestInput[] =
      questions.map((q: QuestionInput) => ({
        text: q.text,
        options: {
          create: q.options.map(
            (opt: OptionInput): Prisma.OptionCreateWithoutQuestionInput => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
            })
          ),
        },
      }));

    // 🔥 Create test with nested data
    const test = await prisma.test.create({
      data: {
        title,
        description,
        duration,
        totalMarks,
        chapterId,
        createdBy: user.id,
        startTime: start,
        endTime: end,
        questions: {
          create: formattedQuestions,
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    return NextResponse.json(test, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create test" },
      { status: 500 }
    );
  }
}