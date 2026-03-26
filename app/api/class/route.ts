import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET() {
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

  // Classrooms where user is ADMIN or TEACHER
  const teaching = await prisma.classroomMember.findMany({
    where: {
      userId: user.id,
      role: { in: ["ADMIN", "TEACHER"] },
    },
    include: {
      classroom: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Classrooms where user is STUDENT
  const enrolled = await prisma.classroomMember.findMany({
    where: {
      userId: user.id,
      role: "STUDENT",
    },
    include: {
      classroom: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({
    teaching: teaching.map((m) => ({
      ...m.classroom,
      role: m.role,
    })),
    enrolled: enrolled.map((m) => ({
      ...m.classroom,
      role: m.role,
    })),
  })
}

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
  const name = body?.name?.trim()
  const description = body?.description?.trim()
 
  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "Classroom name must be at least 2 characters." },
      { status: 400 }
    )
  }
 
  if (!description || description.length < 5) {
    return NextResponse.json(
      { error: "Description must be at least 5 characters." },
      { status: 400 }
    )
  }
 
  // Create classroom + add creator as ADMIN in one transaction
  const classroom = await prisma.$transaction(async (tx) => {
    const created = await tx.classroom.create({
      data: {
        name,
        description,
        creatorId: user.id,
      },
    })
 
    await tx.classroomMember.create({
      data: {
        userId: user.id,
        classroomId: created.id,
        role: "ADMIN",
      },
    })
 
    return created
  })
 
  return NextResponse.json({ classroom }, { status: 201 })
}
 