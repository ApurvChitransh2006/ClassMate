import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subjectId } = await params;

    // ✅ check subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true },
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    // ✅ fetch chapters
    const chapters = await prisma.chapter.findMany({
      where: { subjectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subjectId } = await params;

    // 🔐 Auth
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 👤 current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const name = body?.name?.trim();
    const description = body?.description?.trim();

    // ✅ validation
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Chapter name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (!description || description.length < 5) {
      return NextResponse.json(
        { error: "Description must be at least 5 characters" },
        { status: 400 }
      );
    }

    // 📚 get subject with classroom + teacher
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: {
        id: true,
        classroomId: true,
        teacherId: true,
      },
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    // 🔒 check membership
    const membership = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: user.id,
          classroomId: subject.classroomId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a classroom member" },
        { status: 403 }
      );
    }

    // ✅ permission: ADMIN OR subject teacher
    const isAdmin = membership.role === "ADMIN";
    const isSubjectTeacher = subject.teacherId === user.id;

    if (!isAdmin && !isSubjectTeacher) {
      return NextResponse.json(
        { error: "Only admin or subject teacher can create chapters" },
        { status: 403 }
      );
    }

    // ✅ create chapter
    const chapter = await prisma.chapter.create({
      data: {
        name,
        description,
        subjectId,
      },
    });

    return NextResponse.json({ chapter }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}