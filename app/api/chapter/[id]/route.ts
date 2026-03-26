import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // 📚 get chapter → subject → classroom
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      select: {
        id: true,
        subject: {
          select: {
            classroomId: true,
            teacherId: true,
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

    // 🔒 membership
    const membership = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: user.id,
          classroomId: chapter.subject.classroomId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a classroom member" },
        { status: 403 }
      );
    }

    // ✅ permission
    const isAdmin = membership.role === "ADMIN";
    const isSubjectTeacher = chapter.subject.teacherId === user.id;

    if (!isAdmin && !isSubjectTeacher) {
      return NextResponse.json(
        { error: "Not allowed" },
        { status: 403 }
      );
    }

    // ✅ validation
    if (name && name.length < 2) {
      return NextResponse.json(
        { error: "Name too short" },
        { status: 400 }
      );
    }

    if (description && description.length < 5) {
      return NextResponse.json(
        { error: "Description too short" },
        { status: 400 }
      );
    }

    // ✏️ update
    const updated = await prisma.chapter.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
      },
    });

    return NextResponse.json({ chapter: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // 📚 get chapter → subject
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      select: {
        id: true,
        subject: {
          select: {
            classroomId: true,
            teacherId: true,
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

    // 🔒 membership
    const membership = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: user.id,
          classroomId: chapter.subject.classroomId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a classroom member" },
        { status: 403 }
      );
    }

    // ✅ permission
    const isAdmin = membership.role === "ADMIN";
    const isSubjectTeacher = chapter.subject.teacherId === user.id;

    if (!isAdmin && !isSubjectTeacher) {
      return NextResponse.json(
        { error: "Not allowed" },
        { status: 403 }
      );
    }

    // ❌ delete
    await prisma.chapter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}