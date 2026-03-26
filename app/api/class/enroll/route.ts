import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const body = await req.json()
  const classroomId = body?.classroomId?.trim()

  if (!classroomId) {
    return NextResponse.json({ error: "classroomId is required." }, { status: 400 })
  }

  // Check classroom exists
  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
    select: { id: true, name: true },
  })

  if (!classroom) {
    return NextResponse.json({ error: "Classroom not found." }, { status: 404 })
  }

  // Check if already a member
  const existing = await prisma.classroomMember.findUnique({
    where: { userId_classroomId: { userId: user.id, classroomId } },
  })

  if (existing) {
    return NextResponse.json({ error: "Already a member of this classroom." }, { status: 409 })
  }

  // Enroll as STUDENT
  const member = await prisma.classroomMember.create({
    data: {
      userId: user.id,
      classroomId,
      role: "STUDENT",
    },
  })

  return NextResponse.json(
    { message: "Enrolled successfully.", member, classroom },
    { status: 201 }
  )
}