import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classroomId } = await params;

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

    // ✅ check admin
    const membership = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: user.id,
          classroomId,
        },
      },
    });

    if (!membership || membership.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can remove students" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const studentId = body?.studentId;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // ✅ check student membership
    const studentMembership = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: studentId,
          classroomId,
        },
      },
    });

    if (!studentMembership) {
      return NextResponse.json(
        { error: "Student not found in classroom" },
        { status: 404 }
      );
    }

    // ❗ prevent removing admin or teacher
    if (studentMembership.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Cannot remove admin or teacher" },
        { status: 400 }
      );
    }

    // ✅ delete membership
    await prisma.classroomMember.delete({
      where: {
        userId_classroomId: {
          userId: studentId,
          classroomId,
        },
      },
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