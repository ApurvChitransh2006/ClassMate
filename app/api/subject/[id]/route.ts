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

    // 👤 Current user
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
    const teacherMail = body?.teacherMail?.trim();

    // 📚 Get subject (with old teacher)
    const subject = await prisma.subject.findUnique({
      where: { id },
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

    // 🔒 Admin check
    const membership = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: user.id,
          classroomId: subject.classroomId,
        },
      },
    });

    if (!membership || membership.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can edit subjects" },
        { status: 403 }
      );
    }

    const oldTeacherId = subject.teacherId;
    let newTeacherId: string | undefined = undefined;

    // 👨‍🏫 Handle teacher change
    if (teacherMail) {
      const teacher = await prisma.user.findUnique({
        where: { email: teacherMail },
        select: { id: true },
      });

      if (!teacher) {
        return NextResponse.json(
          { error: "Teacher not found" },
          { status: 404 }
        );
      }

      newTeacherId = teacher.id;

      // ✅ Ensure teacher is member
      await prisma.classroomMember.upsert({
        where: {
          userId_classroomId: {
            userId: teacher.id,
            classroomId: subject.classroomId,
          },
        },
        update: {},
        create: {
          userId: teacher.id,
          classroomId: subject.classroomId,
          role: "TEACHER",
        },
      });
    }

    // ✏️ Update subject
    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(newTeacherId && { teacherId: newTeacherId }),
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // 🧹 Cleanup old teacher (IMPORTANT)
    if (newTeacherId && oldTeacherId !== newTeacherId) {
      const remainingSubjects = await prisma.subject.count({
        where: {
          classroomId: subject.classroomId,
          teacherId: oldTeacherId,
        },
      });

      if (remainingSubjects === 0) {
        const oldMembership = await prisma.classroomMember.findUnique({
          where: {
            userId_classroomId: {
              userId: oldTeacherId,
              classroomId: subject.classroomId,
            },
          },
        });

        // ❗ Only remove if TEACHER (never ADMIN)
        if (oldMembership?.role === "TEACHER") {
          await prisma.classroomMember.delete({
            where: {
              userId_classroomId: {
                userId: oldTeacherId,
                classroomId: subject.classroomId,
              },
            },
          });
        }
      }
    }

    return NextResponse.json({ subject: updatedSubject });
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ get subject info (IMPORTANT before delete)
    const subject = await prisma.subject.findUnique({
      where: { id },
      select: {
        classroomId: true,
        teacherId: true,
      },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // ✅ check admin permission
    const membership = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: user.id,
          classroomId: subject.classroomId,
        },
      },
    });

    if (!membership || membership.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete subjects" },
        { status: 403 },
      );
    }

    // ✅ DELETE SUBJECT
    await prisma.subject.delete({
      where: { id },
    });

    // ✅ CHECK: does teacher still have subjects in this classroom?
    const remainingSubjects = await prisma.subject.count({
      where: {
        classroomId: subject.classroomId,
        teacherId: subject.teacherId,
      },
    });

    // ❗ Only remove if NO subjects AND role is TEACHER
    if (remainingSubjects === 0) {
      const teacherMembership = await prisma.classroomMember.findUnique({
        where: {
          userId_classroomId: {
            userId: subject.teacherId,
            classroomId: subject.classroomId,
          },
        },
      });

      if (teacherMembership?.role === "TEACHER") {
        await prisma.classroomMember.delete({
          where: {
            userId_classroomId: {
              userId: subject.teacherId,
              classroomId: subject.classroomId,
            },
          },
        });
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
