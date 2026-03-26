import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {id} = await params

  const content = await prisma.content.findUnique({
    where: { id },
    include: {
      chapter: {
        include: {
          subject: {
            include: {
              classroom: {
                include: {
                  members: { where: { userId: session.user.id } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!content) {
    return NextResponse.json({ error: "Content not found." }, { status: 404 });
  }

  const subject = content.chapter.subject;
  const member = subject.classroom.members[0];
  const isTeacher =
    subject.teacherId === session.user.id || member?.role === "ADMIN";

  if (!isTeacher) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await prisma.content.delete({ where: { id } });

  return NextResponse.json({ success: true });
}