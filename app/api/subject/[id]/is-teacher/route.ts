import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }>}
) {
  const {id: subjectId} = await params;

  const session = await auth();

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { teacherId: true },
  });

  if (!subject) {
    return new Response("Subject not found", { status: 404 });
  }

  const isTeacher = subject.teacherId === user.id;

  return Response.json({ isTeacher });
}