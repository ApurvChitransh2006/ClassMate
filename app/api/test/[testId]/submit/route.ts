import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// POST /api/test/[testId]/submit
// Body: { answers: { questionId: string; optionId: string }[] }

export async function POST(
  req: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testId } = await params;

    const { answers } = await req.json() as {
      answers: { questionId: string; optionId: string }[];
    };

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: "No answers provided" }, { status: 400 });
    }

    // 🔹 Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🔹 Get test with questions + options
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // 🔹 Time window check
    const now = new Date();
    if (test.startTime && now < test.startTime) {
      return NextResponse.json({ error: "Test has not started yet" }, { status: 400 });
    }
    if (test.endTime && now > test.endTime) {
      return NextResponse.json({ error: "Test has already ended" }, { status: 400 });
    }

    // 🔹 Validate every answer — questionId and optionId must belong to this test
    const questionMap = new Map(test.questions.map((q) => [q.id, q]));

    for (const ans of answers) {
      const question = questionMap.get(ans.questionId);
      if (!question) {
        return NextResponse.json(
          { error: `Question ${ans.questionId} does not belong to this test` },
          { status: 400 }
        );
      }
      const optionBelongs = question.options.some((o) => o.id === ans.optionId);
      if (!optionBelongs) {
        return NextResponse.json(
          { error: `Option ${ans.optionId} does not belong to question ${ans.questionId}` },
          { status: 400 }
        );
      }
    }

    // 🔹 Score calculation
    // Marks per question = totalMarks / number of questions
    const marksPerQuestion = test.totalMarks / test.questions.length;

    let correctCount = 0;
    for (const ans of answers) {
      const question = questionMap.get(ans.questionId)!;
      const chosenOption = question.options.find((o) => o.id === ans.optionId);
      if (chosenOption?.isCorrect) correctCount++;
    }

    const score = Math.round(correctCount * marksPerQuestion);

    // 🔥 Create attempt + answers in one transaction
    const attempt = await prisma.$transaction(async (tx) => {
      const newAttempt = await tx.attempt.create({
        data: {
          userId: user.id,
          testId: test.id,
          score,
          answers: {
            create: answers.map((ans) => ({
              questionId: ans.questionId,
              optionId: ans.optionId,
            })),
          },
        },
        include: {
          answers: true,
        },
      });
      return newAttempt;
    });

    return NextResponse.json(
      {
        attemptId: attempt.id,
        score,
        totalMarks: test.totalMarks,
        correct: correctCount,
        total: test.questions.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to submit test" }, { status: 500 });
  }
}