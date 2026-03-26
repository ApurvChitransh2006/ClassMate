import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server"


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: chapId } = await params

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapId },
    include: {
      contents: { orderBy: { createdAt: "desc" } },
      subject: {
        include: {
          classroom: {
            include: {
              members: {
                where: { userId: session.user.id },
              },
            },
          },
        },
      },
    },
  });

  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  const subject = chapter.subject;
  const classroom = subject.classroom;

  // Check the user is a member of this classroom
  const member = classroom.members[0];
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isTeacher =
    subject.teacherId === session.user.id || member.role === "ADMIN";

  return NextResponse.json({
    id: chapter.id,
    name: chapter.name,
    description: chapter.description,
    subjectId: subject.id,
    subjectName: subject.name,
    classroomId: classroom.id,
    classroomName: classroom.name,
    contents: chapter.contents,
    isTeacher,
  });
}