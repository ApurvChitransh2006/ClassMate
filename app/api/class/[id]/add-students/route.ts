import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(
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

    const body = await req.json();
    const rawEmails: string = body?.emails;

    if (!rawEmails) {
      return NextResponse.json(
        { error: "Emails are required" },
        { status: 400 }
      );
    }

    // ✅ STEP 1: split + clean
    const emails = rawEmails
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    // ✅ remove duplicates
    const uniqueEmails = [...new Set(emails)];

    if (uniqueEmails.length === 0) {
      return NextResponse.json(
        { error: "No valid emails provided" },
        { status: 400 }
      );
    }

    // ✅ check classroom exists
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
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
        { error: "Only admins can add students" },
        { status: 403 }
      );
    }

    // ✅ STEP 2: find users
    const users = await prisma.user.findMany({
      where: {
        email: { in: uniqueEmails },
      },
      select: { id: true, email: true },
    });

    const foundEmails = users.map((u) => u.email);

    // ❗ emails not found in DB
    const notFoundEmails = uniqueEmails.filter(
      (email) => !foundEmails.includes(email)
    );

    // ✅ STEP 3: check already existing members
    const existingMembers = await prisma.classroomMember.findMany({
      where: {
        classroomId,
        userId: { in: users.map((u) => u.id) },
      },
      select: { userId: true },
    });

    const existingUserIds = new Set(existingMembers.map((m) => m.userId));

    // ✅ STEP 4: filter new users only
    const newUsers = users.filter((u) => !existingUserIds.has(u.id));

    // ✅ STEP 5: bulk insert
    if (newUsers.length > 0) {
      await prisma.classroomMember.createMany({
        data: newUsers.map((u) => ({
          userId: u.id,
          classroomId,
          role: "STUDENT",
        })),
        skipDuplicates: true, // extra safety
      });
    }

    return NextResponse.json({
      success: true,
      classroom,
      added: newUsers.length,
      alreadyPresent: existingMembers.length,
      notFound: notFoundEmails,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}