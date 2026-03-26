import { auth } from "@/auth";
import { CONTENT_TYPE } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server"

function isValidYouTubeUrl(url: string) {
  return /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/.test(url);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, type, url, chapterId } = body;

  // ✅ Basic validations
  if (!name?.trim() || name.trim().length < 2) {
    return NextResponse.json(
      { error: "Name must be at least 2 characters." },
      { status: 400 }
    );
  }

  if (!description?.trim() || description.trim().length < 5) {
    return NextResponse.json(
      { error: "Description must be at least 5 characters." },
      { status: 400 }
    );
  }

  if (!["DOCUMENT", "VIDEO"].includes(type)) {
    return NextResponse.json(
      { error: "Invalid content type." },
      { status: 400 }
    );
  }

  if (!url?.trim()) {
    return NextResponse.json(
      { error: "URL is required." },
      { status: 400 }
    );
  }

  if (!chapterId?.trim()) {
    return NextResponse.json(
      { error: "chapterId is required." },
      { status: 400 }
    );
  }

  // ✅ 🔥 New Logic: YouTube validation for VIDEO
  if (type === "VIDEO" && !isValidYouTubeUrl(url)) {
    return NextResponse.json(
      { error: "Please provide a valid YouTube URL." },
      { status: 400 }
    );
  }

  if (type === "DOCUMENT" && isValidYouTubeUrl(url)) {
    return NextResponse.json(
      { error: "Documents cannot be YouTube links." },
      { status: 400 }
    );
  }

  // ✅ Verify chapter & permissions
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
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
  });

  if (!chapter) {
    return NextResponse.json(
      { error: "Chapter not found." },
      { status: 404 }
    );
  }

  const subject = chapter.subject;
  const member = subject.classroom.members[0];

  const isTeacher =
    subject.teacherId === session.user.id || member?.role === "ADMIN";

  if (!isTeacher) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // ✅ Save content (same as before)
  const content = await prisma.content.create({
    data: {
      name: name.trim(),
      description: description.trim(),
      type: type as CONTENT_TYPE,
      url: url.trim(), // 🔥 Now stores YouTube URL for videos
      chapterId,
    },
  });

  return NextResponse.json(content, { status: 201 });
}