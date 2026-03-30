"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Lightbulb,
  BookOpen,
  FileText,
  Video,
  ArrowRight,
  LogOut,
  User,
  Loader2,
  Plus,
  Upload,
  ExternalLink,
  AlertCircle,
  ArrowLeft,
  ClipboardList,
} from "lucide-react";
import { signOut } from "next-auth/react";

// ── Types ──────────────────────────────────────────────
type ContentType = "DOCUMENT" | "VIDEO";

type Content = {
  id: string;
  name: string;
  description: string;
  type: ContentType;
  url: string;
  createdAt: string;
};

type ChapterData = {
  id: string;
  name: string;
  description: string;
  subjectId: string;
  subjectName: string;
  classroomId: string;
  classroomName: string;
  contents: Content[];
  isTeacher: boolean;
};

type TestItem = {
  id: string;
  title: string;
  description?: string | null;

  duration: number;
  totalMarks: number;

  startTime?: string | null;
  endTime?: string | null;

  createdAt: string;

  attempted: boolean;
  score: number | null;
};

// ── Content Card ───────────────────────────────────────
function ContentCard({
  content,
  isTeacher,
  onDeleted,
}: {
  content: Content;
  chapterId: string;
  isTeacher: boolean;
  onDeleted: (id: string) => void;
}) {
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [deleting, startDelete] = useTransition();

  const isDoc = content.type === "DOCUMENT";

  const openContent = async () => {
    if (!isDoc) {
      window.open(content.url, "_blank");
      return;
    }

    setLoadingUrl(true);
    try {
      const res = await fetch("/api/content/aws/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: content.url }),
      });
      const data = await res.json();
      if (data.url) window.open(data.url, "_blank");
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleDelete = () => {
    startDelete(async () => {
      const res = await fetch(`/api/content/${content.id}`, {
        method: "DELETE",
      });
      if (res.ok) onDeleted(content.id);
    });
  };

  return (
    <Card className="group border border-border bg-card rounded-2xl shadow-none hover:shadow-md transition-all duration-200 overflow-hidden">
      <div
        className={`h-1 w-full ${
          isDoc
            ? "bg-linear-to-r from-amber-500 to-orange-500"
            : "bg-linear-to-r from-blue-500 to-indigo-500"
        }`}
      />
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                isDoc
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              }`}
            >
              {isDoc ? (
                <FileText className="w-4 h-4" />
              ) : (
                <Video className="w-4 h-4" />
              )}
            </div>
            <h3 className="text-sm font-bold leading-snug line-clamp-1">
              {content.name}
            </h3>
          </div>
          <Badge
            variant="outline"
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${
              isDoc
                ? "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10"
                : "text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10"
            }`}
          >
            {isDoc ? "Document" : "Video"}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {content.description}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 rounded-xl border-border hover:bg-muted/60 font-medium text-xs h-9 group-hover:border-blue-500/40 transition-colors"
            onClick={openContent}
            disabled={loadingUrl}
          >
            {loadingUrl ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                Open <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </>
            )}
          </Button>
          {isTeacher && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-medium text-xs h-9"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Upload Content Sheet ───────────────────────────────
function UploadContentSheet({
  open,
  onClose,
  chapterId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  chapterId: string;
  onCreated: (content: Content) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ContentType>("DOCUMENT");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setName("");
    setDescription("");
    setType("DOCUMENT");
    setFile(null);
    setVideoUrl(""); // ✅ important
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleSubmit = () => {
    if (!name.trim() || name.trim().length < 2) {
      setError("Content name must be at least 2 characters.");
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setError("Description must be at least 5 characters.");
      return;
    }
    if (type === "DOCUMENT" && !file) {
      setError("Please select a file to upload.");
      return;
    }

    if (type === "VIDEO" && !videoUrl.trim()) {
      setError("Please provide a YouTube URL.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        let finalUrl = "";

        // ✅ DOCUMENT → upload to S3
        if (type === "DOCUMENT") {
          const formData = new FormData();
          formData.append("file", file!);

          const uploadRes = await fetch("/api/content/aws/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) {
            setError("Failed to get upload URL.");
            return;
          }

          const { url: presignedUrl, key } = await uploadRes.json();

          const s3Res = await fetch(presignedUrl, {
            method: "PUT",
            body: file!,
            headers: { "Content-Type": file!.type },
          });

          if (!s3Res.ok) {
            setError("Failed to upload file.");
            return;
          }

          finalUrl = key;
        }

        // ✅ VIDEO → just store YouTube URL
        if (type === "VIDEO") {
          finalUrl = videoUrl.trim();
        }

        // ✅ Save content
        const res = await fetch(`/api/content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            type,
            url: finalUrl,
            chapterId,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Something went wrong.");
          return;
        }

        onCreated(data);
        handleClose();
      } catch {
        setError("Network error. Please try again.");
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={(v: boolean) => !v && handleClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col gap-0 p-0 overflow-y-auto"
      >
        <SheetHeader className="px-6 pt-7 pb-5 border-b border-border shrink-0">
          <SheetTitle className="text-xl font-extrabold tracking-tight">
            Upload Content
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Add a document or video to this chapter.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 px-6 py-6 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
              Content Name
            </label>
            <Input
              placeholder="e.g. Introduction to Kinematics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl h-10 bg-muted/40 border-border text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
              Description
            </label>
            <Textarea
              placeholder="What does this content cover?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-xl bg-muted/40 border-border text-sm resize-none"
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
              Content Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["DOCUMENT", "VIDEO"] as ContentType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                    type === t
                      ? t === "DOCUMENT"
                        ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  {t === "DOCUMENT" ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                  {t === "DOCUMENT" ? "Document" : "Video"}
                </button>
              ))}
            </div>
          </div>

          {/* File upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
              {type === "DOCUMENT" ? "File" : "YouTube URL"}
            </label>

            {type === "DOCUMENT" ? (
              <div
                className="relative flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-8 cursor-pointer hover:border-blue-500/50 hover:bg-muted/30 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="w-6 h-6 text-muted-foreground" />
                {file ? (
                  <p className="text-sm font-medium text-foreground line-clamp-1 px-4 text-center">
                    {file.name}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click to select a file
                  </p>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="rounded-xl h-10 bg-muted/40 border-border text-sm"
              />
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 shrink-0 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-full font-semibold border-border"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold shadow-md shadow-blue-500/20"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Uploading…
              </>
            ) : (
              <>
                Upload <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Test Card ──────────────────────────────────────────
function TestCard({
  test,
  isTeacher,
  onDelete,
}: {
  test: {
    id: string;
    title: string;
    duration: number;
    totalMarks: number;
    attempted: boolean;
    score: number | null;
  };
  isTeacher: boolean;
  onDelete?: (id: string) => void;
}) {
  const [deleting, startDelete] = useTransition();

  const handleDelete = () => {
    startDelete(async () => {
      const res = await fetch(`/api/test/${test.id}`, {
        method: "DELETE",
      });
      if (res.ok && onDelete) onDelete(test.id);
    });
  };

  return (
    <Card className="group border border-border bg-card rounded-2xl shadow-none hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Top gradient bar */}
      <div
        className={`h-1 w-full ${
          test.attempted
            ? "bg-linear-to-r from-emerald-500 to-green-500"
            : "bg-linear-to-r from-indigo-500 to-blue-500"
        }`}
      />

      <CardContent className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                test.attempted
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
            </div>

            <h3 className="text-sm font-bold leading-snug line-clamp-1">
              {test.title}
            </h3>
          </div>

          <Badge
            variant="outline"
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${
              test.attempted
                ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                : "text-indigo-600 dark:text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
            }`}
          >
            {test.attempted ? "Attempted" : "New"}
          </Badge>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {test.duration} mins • {test.totalMarks} marks
        </p>

        {/* Score (if attempted) */}
        {test.attempted && (
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Score: {test.score ?? 0} / {test.totalMarks}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {!test.attempted ? (
            // 👉 NOT ATTEMPTED
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-xl border-border hover:bg-muted/60 font-medium text-xs h-9 group-hover:border-indigo-500/40 transition-colors"
              onClick={() => window.open(`/dashboard/test/${test.id}`, "_blank")}
            >
              Start Test
            </Button>
          ) : (
            // 👉 ATTEMPTED → SHOW 2 BUTTONS
            <>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 rounded-xl border-border hover:bg-muted/60 font-medium text-xs h-9"
                onClick={() => window.open(`/dashboard/test/${test.id}`, "_blank")}
              >
                Re-attempt
              </Button>

              <Button
                size="sm"
                className="flex-1 rounded-xl text-xs h-9 bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={() => window.open(`/dashboard/result/${test.id}`, "_blank")}
              >
                View Result
              </Button>
            </>
          )}

          {isTeacher && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-medium text-xs h-9"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Chapter Page ───────────────────────────────────────
export default function ChapterPage() {
  const { data: session, status } = useSession();
  const params = useParams<{
    classId: string;
    subId: string;
    chapId: string;
  }>();

  const [data, setData] = useState<ChapterData | null>(null);
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [canManage, setCanManage] = useState(false);

  if (status === "unauthenticated") redirect("/login");

  const user = session?.user;
  const displayName = user?.name ?? "Unknown";

  useEffect(() => {
    if (status !== "authenticated" || !params.classId) return;

    Promise.all([
      fetch(`/api/content/chapter/${params.chapId}`).then((r) => {
        if (!r.ok) throw new Error("Failed to load chapter");
        return r.json();
      }),

      fetch(`/api/class/is-admin/${params.classId}`).then((r) => r.json()),

      fetch(`/api/chapter/${params.chapId}/get-test`).then((r) => {
        if (!r.ok) throw new Error("Failed to load tests");
        return r.json(); // returns TestItem[]
      }),
    ])
      .then(([chapterData, adminRes, testsData]) => {
        setData(chapterData);
        setTests(testsData.tests);

        setCanManage(adminRes.isAdmin || chapterData.isTeacher);
      })
      .catch((e) => {
        setError(e.message);
        setCanManage(false);
      })
      .finally(() => setLoading(false));
  }, [status, params.classId, params.chapId]);

  const handleContentCreated = (content: Content) => {
    setData((prev) =>
      prev ? { ...prev, contents: [content, ...prev.contents] } : prev,
    );
  };

  const handleContentDeleted = (id: string) => {
    setData((prev) =>
      prev
        ? { ...prev, contents: prev.contents.filter((c) => c.id !== id) }
        : prev,
    );
  };

  const handleTestDeleted = (id: string) => {
    setTests((prev) => prev.filter((t) => t.id !== id));
  };

  const docs =
    data?.contents
      .filter((c) => c.type === "DOCUMENT")
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ) ?? [];

  const videos =
    data?.contents
      .filter((c) => c.type === "VIDEO")
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ) ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Class<span className="text-blue-500">Mate</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/profile">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:bg-muted/60 transition-colors">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={displayName}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                )}
                <span className="text-sm font-medium hidden sm:block">
                  {displayName}
                </span>
              </button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ redirectTo: "/" })}
              className="flex items-center gap-2 rounded-full border-border hover:bg-muted/60 font-medium transition-all hover:scale-[1.02]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-100 bg-linear-to-b from-blue-500/10 to-transparent rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-40 left-10 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-24 sm:pt-28 pb-16 space-y-10">
        {/* Page header */}
        <Link
          href={`/dashboard/classroom/${params.classId}/subject/${params.subId}`}
        >
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground rounded-full -ml-2 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Subject
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            {loading ? (
              <div className="h-8 w-48 bg-muted/60 rounded-xl animate-pulse" />
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-500 shrink-0" />
                  {data?.name ?? "Chapter"}
                </h1>
                {data?.description && (
                  <p className="text-muted-foreground text-sm max-w-xl">
                    {data.description}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canManage && (
              <Link
                href={`/dashboard/test/new/${params.chapId}`}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-5 h-10 font-semibold shadow-md shadow-emerald-500/20 flex items-center gap-2 text-sm"
              >
                <ClipboardList className="w-4 h-4" />
                Create Test
              </Link>
            )}

            {canManage && (
              <Button
                onClick={() => setUploadSheetOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-5 h-10 font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2 text-sm"
              >
                <Upload className="w-4 h-4" />
                Upload Content
              </Button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Content */}
        {!loading && data && (
          <>
            {/* Documents */}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    Documents
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {docs.length} file{docs.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {docs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-2xl bg-muted/20">
                  <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center mb-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    No documents yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((c) => (
                    <ContentCard
                      key={c.id}
                      content={c}
                      chapterId={data.id}
                      isTeacher={data.isTeacher}
                      onDeleted={handleContentDeleted}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Videos */}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Videos</h2>
                  <p className="text-xs text-muted-foreground">
                    {videos.length} video{videos.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-2xl bg-muted/20">
                  <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center mb-2">
                    <Video className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    No videos yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((c) => (
                    <ContentCard
                      key={c.id}
                      content={c}
                      chapterId={data.id}
                      isTeacher={data.isTeacher}
                      onDeleted={handleContentDeleted}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Tests</h2>
                  <p className="text-xs text-muted-foreground">
                    {tests.length} test{tests.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {tests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-2xl bg-muted/20">
                  <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center mb-2">
                    <ClipboardList className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    No tests yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tests.map((t) => (
                    <TestCard
                      key={t.id}
                      test={t}
                      isTeacher={data.isTeacher}
                      onDelete={handleTestDeleted} // optional
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Lightbulb className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-foreground">ClassMate</span>
          </div>
          <p>
            Advancing UN Sustainable Development Goal 4 · Quality Education for
            All
          </p>
          <p>© 2026 ClassMate</p>
        </div>
      </footer>

      {data?.isTeacher && (
        <UploadContentSheet
          open={uploadSheetOpen}
          onClose={() => setUploadSheetOpen(false)}
          chapterId={params.chapId}
          onCreated={handleContentCreated}
        />
      )}
    </div>
  );
}
