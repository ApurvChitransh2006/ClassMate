import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const {id: chapId} = await params;

  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const tests = await prisma.test.findMany({
      where: { chapterId: chapId },
      orderBy: { createdAt: "desc" },

      include: {
        attempts: {
          where: { userId: user.id },
          select: {
            score: true,
          },
        },
      },
    });

    // 🔥 Transform response
    const formatted = tests.map((test) => {
      const attempt = test.attempts[0]; // user will usually have 1 attempt

      return {
        id: test.id,
        title: test.title,
        duration: test.duration,
        totalMarks: test.totalMarks,
        attempted: !!attempt,
        score: attempt?.score ?? null,
      };
    });

    return NextResponse.json({ tests: formatted });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    );
  }
}