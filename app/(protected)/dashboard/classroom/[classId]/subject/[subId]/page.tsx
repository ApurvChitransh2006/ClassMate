"use client";

import { useEffect, useState, useTransition, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Lightbulb,
  ArrowLeft,
  Loader2,
  User,
  LogOut,
  BookOpen,
  Plus,
  ArrowRight,
  MoreVertical,
  Pencil,
  Trash2,
  FileText,
  Hash,
} from "lucide-react";
import { signOut } from "next-auth/react";

// ── Types ──────────────────────────────────────────────
type Chapter = {
  id: string;
  name: string;
  description: string;
  subjectId: string;
  createdAt: string;
};

// ── Empty State ────────────────────────────────────────
function EmptyChapters() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl bg-muted/20">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <FileText className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-muted-foreground">
        No chapters yet
      </p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        Chapters will appear here once the teacher adds them.
      </p>
    </div>
  );
}

// ── Chapter Card ───────────────────────────────────────
function ChapterCard({
  chapter,
  index,
  subjectId,
  classId,
  canManage,
  onEdit,
  onDelete,
}: {
  chapter: Chapter;
  index: number;
  subjectId: string;
  classId: string;
  canManage: boolean;
  onEdit: (chapter: Chapter) => void;
  onDelete: (id: string) => void;
}) {
  const colors = [
    { accent: "from-blue-500 to-indigo-500", icon: "bg-blue-500/10 text-blue-500", glow: "hover:shadow-blue-500/10" },
    { accent: "from-violet-500 to-purple-500", icon: "bg-violet-500/10 text-violet-500", glow: "hover:shadow-violet-500/10" },
    { accent: "from-emerald-500 to-teal-500", icon: "bg-emerald-500/10 text-emerald-500", glow: "hover:shadow-emerald-500/10" },
    { accent: "from-amber-500 to-orange-500", icon: "bg-amber-500/10 text-amber-500", glow: "hover:shadow-amber-500/10" },
    { accent: "from-rose-500 to-pink-500", icon: "bg-rose-500/10 text-rose-500", glow: "hover:shadow-rose-500/10" },
    { accent: "from-cyan-500 to-sky-500", icon: "bg-cyan-500/10 text-cyan-500", glow: "hover:shadow-cyan-500/10" },
  ];

  const color = colors[index % colors.length];

  return (
    <div
      className={`group relative bg-card border border-border rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${color.glow}`}
    >
      {/* Top accent */}
      <div className={`h-0.5 w-full bg-linear-to-r ${color.accent}`} />

      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Chapter number */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color.icon}`}>
              <span className="text-sm font-bold">{index + 1}</span>
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-sm font-bold leading-snug line-clamp-1">
                {chapter.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(chapter.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Admin menu */}
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition shrink-0 opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => onEdit(chapter)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Chapter?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this chapter and all its contents.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-500"
                        onClick={() => onDelete(chapter.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {chapter.description}
        </p>

        {/* CTA */}
        <div className="pt-1">
          <Link href={`/dashboard/classroom/${classId}/subject/${subjectId}/chapter/${chapter.id}`}>
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 rounded-xl text-xs font-medium border-border hover:bg-muted/60 flex items-center justify-center gap-1.5 group-hover:border-muted-foreground/30 transition-colors"
            >
              Open Chapter
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Add Chapter Sheet ──────────────────────────────────
function AddChapterSheet({
  subjectId,
  open,
  onClose,
  onAdded,
}: {
  subjectId: string;
  open: boolean;
  onClose: () => void;
  onAdded: (chapter: Chapter) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setName("");
    setDescription("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!name.trim() || name.trim().length < 2) {
      setError("Chapter name must be at least 2 characters.");
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setError("Description must be at least 5 characters.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/chapter/subject/${subjectId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), description: description.trim() }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Something went wrong.");
          return;
        }

        onAdded(data.chapter);
        handleClose();
      } catch {
        setError("Network error. Please try again.");
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-3 shadow-md shadow-violet-500/20">
            <Hash className="w-5 h-5 text-white" />
          </div>
          <SheetHeader className="text-left p-0 space-y-1">
            <SheetTitle className="text-xl font-extrabold tracking-tight">
              Add Chapter
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground leading-relaxed">
              Add a new chapter to this subject.
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Chapter name
            </label>
            <Input
              placeholder="e.g. Introduction to Algebra"
              value={name}
              autoFocus
              disabled={isPending}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="h-11 rounded-xl bg-background border-border focus-visible:ring-violet-500/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Description
            </label>
            <Textarea
              placeholder="What does this chapter cover?"
              value={description}
              disabled={isPending}
              rows={4}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setDescription(e.target.value);
                if (error) setError(null);
              }}
              className="rounded-xl bg-background border-border focus-visible:ring-violet-500/40 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-border flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-full border-border hover:bg-muted/60 font-medium"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-11 bg-violet-600 hover:bg-violet-500 text-white rounded-full font-semibold shadow-md shadow-violet-500/20"
            onClick={handleSubmit}
            disabled={isPending || !name.trim() || !description.trim()}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                Add Chapter <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Edit Chapter Sheet (inner) ─────────────────────────
function EditChapterSheetInner({
  chapter,
  onClose,
  onUpdated,
}: {
  chapter: Chapter;
  onClose: () => void;
  onUpdated: (chapter: Chapter) => void;
}) {
  const [name, setName] = useState(chapter.name);
  const [description, setDescription] = useState(chapter.description);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!name.trim() || name.trim().length < 2) {
      setError("Chapter name must be at least 2 characters.");
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setError("Description must be at least 5 characters.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/chapter/${chapter.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), description: description.trim() }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Something went wrong.");
          return;
        }

        onUpdated(data.chapter);
        onClose();
      } catch {
        setError("Network error. Please try again.");
      }
    });
  };

  return (
    <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 shadow-md shadow-amber-500/20">
            <Pencil className="w-5 h-5 text-white" />
          </div>
          <SheetHeader className="text-left p-0 space-y-1">
            <SheetTitle className="text-xl font-extrabold tracking-tight">
              Edit Chapter
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground leading-relaxed">
              Update this chapter&apos;s details.
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Chapter name
            </label>
            <Input
              value={name}
              autoFocus
              disabled={isPending}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className="h-11 rounded-xl bg-background border-border focus-visible:ring-amber-500/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Description
            </label>
            <Textarea
              value={description}
              disabled={isPending}
              rows={4}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setDescription(e.target.value);
                if (error) setError(null);
              }}
              className="rounded-xl bg-background border-border focus-visible:ring-amber-500/40 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-border flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-full border-border hover:bg-muted/60 font-medium"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-11 bg-amber-500 hover:bg-amber-400 text-white rounded-full font-semibold shadow-md shadow-amber-500/20"
            onClick={handleSubmit}
            disabled={isPending || !name.trim() || !description.trim()}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                Save Changes <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </SheetContent>
  );
}

// ── Edit Chapter Sheet (outer wrapper) ────────────────
function EditChapterSheet({
  chapter,
  open,
  onClose,
  onUpdated,
}: {
  chapter: Chapter | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (chapter: Chapter) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      {chapter && (
        <EditChapterSheetInner
          key={chapter.id}
          chapter={chapter}
          onClose={onClose}
          onUpdated={onUpdated}
        />
      )}
    </Sheet>
  );
}

// ── Page ───────────────────────────────────────────────
export default function SubjectPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const classId = params?.classId as string;
  const subId = params?.subId as string;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editChapter, setEditChapter] = useState<Chapter | null>(null);

  if (status === "unauthenticated") redirect("/login");

  const user = session?.user;
  const displayName = user?.name ?? "Unknown";

  // Check if admin
useEffect(() => {
  if (!classId || !subId) return;

  Promise.all([
    fetch(`/api/class/is-admin/${classId}`).then((r) => r.json()),
    fetch(`/api/subject/${subId}/is-teacher`).then((r) => r.json()),
  ])
    .then(([adminRes, teacherRes]) => {
      setCanManage(adminRes.isAdmin || teacherRes.isTeacher);
    })
    .catch(() => setCanManage(false));
}, [classId, subId]);

  // Fetch chapters
  useEffect(() => {
    if (status !== "authenticated" || !subId) return;
    fetch(`/api/chapter/subject/${subId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load chapters");
        return r.json();
      })
      .then((d) => setChapters(d.chapters))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status, subId]);

  const handleChapterAdded = (chapter: Chapter) => {
    setChapters((prev) => [chapter, ...prev]);
  };

  const handleChapterUpdated = (updated: Chapter) => {
    setChapters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/chapter/${id}`, { method: "DELETE" });
      if (!res.ok) return;
      setChapters((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">
              Class<span className="text-blue-500">Mate</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
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
                <span className="text-sm font-medium hidden sm:block">{displayName}</span>
              </button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ redirectTo: "/" })}
              className="flex items-center gap-2 rounded-full border-border hover:bg-muted/60 font-medium transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-100 bg-linear-to-b from-violet-500/10 to-transparent rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-40 left-10 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-24 sm:pt-28 pb-16 space-y-8">

        {/* Back + Header */}
        <div className="space-y-4">
          <Link href={`/dashboard/classroom/${classId}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground rounded-full -ml-2 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Classroom
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-violet-500" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Chapters
                </h1>
              </div>
              <p className="text-muted-foreground text-sm pl-11">
                All chapters for this subject.
              </p>
            </div>

            <div className="flex items-center gap-2 pl-11 sm:pl-0">
              {!loading && (
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-xs font-semibold rounded-full border-border bg-muted/40"
                >
                  {chapters.length} chapter{chapters.length !== 1 ? "s" : ""}
                </Badge>
              )}

              {canManage && (
                <Button
                  onClick={() => setAddOpen(true)}
                  className="bg-violet-600 hover:bg-violet-500 text-white rounded-full px-4 h-9 font-semibold shadow-md shadow-violet-500/20 flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Chapter
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Chapters */}
        {!loading && !error && (
        chapters.length === 0 ? (
            <EmptyChapters />
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...chapters]
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((chapter, i) => (
                <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    index={i}
                    subjectId={subId}
                    classId={classId}
                    canManage={canManage}
                    onEdit={setEditChapter}
                    onDelete={handleDelete}
                />
                ))}
            </div>
        )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Lightbulb className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-foreground">ClassMate</span>
          </div>
          <p>Advancing UN Sustainable Development Goal 4 · Quality Education for All</p>
          <p>© 2026 ClassMate</p>
        </div>
      </footer>

      {/* Sheets */}
      <AddChapterSheet
        subjectId={subId}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={handleChapterAdded}
      />

      <EditChapterSheet
        chapter={editChapter}
        open={!!editChapter}
        onClose={() => setEditChapter(null)}
        onUpdated={handleChapterUpdated}
      />
    </div>
  );
}