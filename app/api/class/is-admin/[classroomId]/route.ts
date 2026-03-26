import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"; // or getServerSession depending on your setup
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ classroomId: string }> }
) {
    // ✅ unwrap params (IMPORTANT - your earlier error)
    const { classroomId } = await params;

    // ✅ get session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // ✅ get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 404 });
    }

    // ✅ check membership
    const membership = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: user.id,
          classroomId,
        },
      },
    });

    const isAdmin = membership?.role === "ADMIN";

    return NextResponse.json({ isAdmin });
}