import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 important
) {
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

  //  unwrap params properly
  const { id: classroomId } = await params

  if (!classroomId) {
    return NextResponse.json({ error: "Missing classroom ID." }, { status: 400 })
  }

  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
    select: { id: true },
  })

  if (!classroom) {
    return NextResponse.json({ error: "Classroom not found." }, { status: 404 })
  }

  const member = await prisma.classroomMember.findUnique({
    where: { userId_classroomId: { userId: user.id, classroomId } },
  })

  if (!member) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 })
  }

  const subjects = await prisma.subject.findMany({
    where: { classroomId },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      teacher: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ subjects })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    // ✅ unwrap params (IMPORTANT)
    const { id: classroomId } = await params

    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ✅ get current user
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
    const teacherMail = body?.teacherMail?.trim()

    // ✅ validations
    if (!classroomId) {
      return NextResponse.json(
        { error: "Classroom ID is required" },
        { status: 400 }
      )
    }

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Subject name must be at least 2 characters" },
        { status: 400 }
      )
    }

    if (!description || description.length < 5) {
      return NextResponse.json(
        { error: "Description must be at least 5 characters" },
        { status: 400 }
      )
    }

    if (!teacherMail) {
      return NextResponse.json(
        { error: "Teacher email is required" },
        { status: 400 }
      )
    }

    // ✅ check classroom exists
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    })

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      )
    }

    // ✅ check admin
    const membership = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: user.id,
          classroomId,
        },
      },
    })

    if (!membership || membership.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can create subjects" },
        { status: 403 }
      )
    }

    // ✅ find teacher by email
    const teacher = await prisma.user.findUnique({
      where: { email: teacherMail },
      select: { id: true },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      )
    }

    // ✅ create subject
    const subject = await prisma.subject.create({
      data: {
        name,
        description,
        classroomId,
        teacherId: teacher.id, // ✅ FIXED
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
    })

  // ✅ check if teacher already in classroom
  const existingMembership = await prisma.classroomMember.findUnique({
    where: {
      userId_classroomId: {
        userId: teacher.id,
        classroomId,
      },
    },
  });

  // ✅ only create if not present
  if (!existingMembership) {
    await prisma.classroomMember.create({
      data: {
        userId: teacher.id,
        classroomId,
        role: "TEACHER",
      },
    });
}

    return NextResponse.json({ subject }, { status: 201 })
}