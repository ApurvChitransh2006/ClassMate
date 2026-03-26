"use client";

import { useEffect, useState, useTransition, ChangeEvent, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
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
  GraduationCap,
  BookOpen,
  ArrowRight,
  LogOut,
  User,
  Loader2,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { signOut } from "next-auth/react";

// ── Types ──────────────────────────────────────────────
type Classroom = {
  id: string;
  name: string;
  description: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
};

type ClassroomsData = {
  teaching: Classroom[];
  enrolled: Classroom[];
};

// ── Classroom Card ─────────────────────────────────────
function ClassroomCard({ classroom }: { classroom: Classroom }) {
  const isAdmin = classroom.role === "ADMIN";
  const isTeacher = classroom.role === "TEACHER";

  const roleBadge = {
    ADMIN: {
      label: "Admin",
      className:
        "text-violet-600 dark:text-violet-400 border-violet-500/30 bg-violet-500/10",
      icon: ShieldCheck,
    },
    TEACHER: {
      label: "Teacher",
      className:
        "text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10",
      icon: BookOpen,
    },
    STUDENT: {
      label: "Student",
      className:
        "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      icon: GraduationCap,
    },
  }[classroom.role];

  const RoleIcon = roleBadge.icon;

  return (
    <Card className="group border border-border bg-card rounded-2xl shadow-none hover:shadow-md transition-all duration-200 overflow-hidden">
      <div
        className={`h-1 w-full ${
          isAdmin
            ? "bg-linear-to-r from-violet-500 to-purple-500"
            : isTeacher
              ? "bg-linear-to-r from-blue-500 to-indigo-500"
              : "bg-linear-to-r from-emerald-500 to-teal-500"
        }`}
      />
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-snug line-clamp-1 flex-1">
            {classroom.name}
          </h3>
          <Badge
            variant="outline"
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${roleBadge.className}`}
          >
            <RoleIcon className="w-3 h-3" />
            {roleBadge.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {classroom.description}
        </p>
        <div className="pt-1">
          <Link href={`/dashboard/classroom/${classroom.id}`}>
            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-xl border-border hover:bg-muted/60 font-medium text-xs h-9 group-hover:border-blue-500/40 transition-colors"
            >
              Open Classroom <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Empty State ────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-2xl bg-muted/20">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
        <BookOpen className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        No {label} classrooms yet
      </p>
    </div>
  );
}

// ── Section Header ─────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  count,
  color,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">
          {count} classroom{count !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

// ── Create Classroom Sheet ─────────────────────────────
function CreateClassroomSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (classroom: Classroom) => void;
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
      setError("Classroom name must be at least 2 characters.");
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setError("Description must be at least 5 characters.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/class", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Something went wrong.");
          return;
        }

        onCreated({ ...data.classroom, role: "ADMIN" as const });
        handleClose();
      } catch {
        setError("Network error. Please try again.");
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={(v: boolean) => !v && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        <div className="px-6 pt-6 pb-5 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <SheetHeader className="text-left p-0 space-y-1">
            <SheetTitle className="text-xl font-extrabold tracking-tight">
              Create Classroom
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground leading-relaxed">
              Set up a new classroom. You&apos;ll be added as Admin automatically.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Classroom name
            </label>
            <Input
              placeholder="e.g. Grade 10 Mathematics"
              value={name}
              autoFocus
              disabled={isPending}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="h-11 rounded-xl bg-background border-border focus-visible:ring-blue-500/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Description
            </label>
            <Textarea
              placeholder="What is this classroom about?"
              value={description}
              disabled={isPending}
              rows={4}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setDescription(e.target.value);
                if (error) setError(null);
              }}
              className="rounded-xl bg-background border-border focus-visible:ring-blue-500/40 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block shrink-0" />
              {error}
            </p>
          )}
        </div>

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
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold shadow-md shadow-blue-500/20"
            onClick={handleSubmit}
            disabled={isPending || !name.trim() || !description.trim()}
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</>
            ) : (
              <> Create <ArrowRight className="w-4 h-4 ml-1.5" /></>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Enroll Classroom Sheet ─────────────────────────────
function EnrollClassroomSheet({
  open,
  onClose,
  onEnrolled,
}: {
  open: boolean;
  onClose: () => void;
  onEnrolled: (classroom: Classroom) => void;
}) {
  const [classroomId, setClassroomId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setClassroomId("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!classroomId.trim()) {
      setError("Please enter a Classroom ID.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/class/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classroomId: classroomId.trim() }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Something went wrong.");
          return;
        }

        // Fetch the full classroom details to add to UI
        const classRes = await fetch(`/api/class/${classroomId.trim()}`);
        if (classRes.ok) {
          const classData = await classRes.json();
          onEnrolled({ ...classData.classroom, role: "STUDENT" as const });
        }

        handleClose();
      } catch {
        setError("Network error. Please try again.");
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={(v: boolean) => !v && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        <div className="px-6 pt-6 pb-5 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-3 shadow-md shadow-emerald-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <SheetHeader className="text-left p-0 space-y-1">
            <SheetTitle className="text-xl font-extrabold tracking-tight">
              Enroll in Classroom
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground leading-relaxed">
              Enter the Classroom ID shared by your teacher to join.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Classroom ID
            </label>
            <Input
              placeholder="e.g. cm4x9z2k0001abc..."
              value={classroomId}
              autoFocus
              disabled={isPending}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setClassroomId(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="h-11 rounded-xl bg-background border-border focus-visible:ring-emerald-500/40 font-mono text-sm"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block shrink-0" />
              {error}
            </p>
          )}

          <p className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-xl px-4 py-3 leading-relaxed">
            💡 Ask your teacher or admin for the Classroom ID to join.
          </p>
        </div>

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
            className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold shadow-md shadow-emerald-500/20"
            onClick={handleSubmit}
            disabled={isPending || !classroomId.trim()}
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Enrolling...</>
            ) : (
              <> Enroll <ArrowRight className="w-4 h-4 ml-1.5" /></>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Dashboard ──────────────────────────────────────────
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<ClassroomsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classCreateSheetOpen, setClassCreateSheetOpen] = useState(false);
  const [classEnrollSheetOpen, setClassEnrollSheetOpen] = useState(false);

  if (status === "unauthenticated") redirect("/login");

  const user = session?.user;
  const displayName = user?.name ?? "Unknown";

  // ── Fetch classrooms ───────────────────────────────
  const fetchClassrooms = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch("/api/class");
      if (!r.ok) throw new Error("Failed to load classrooms");
      const d = await r.json();
      setData(d);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchClassrooms();
  }, [status, fetchClassrooms]);

  // ── Optimistic handlers ────────────────────────────
  const handleCreated = (classroom: Classroom) => {
    setData((prev) =>
      prev
        ? { ...prev, teaching: [classroom, ...prev.teaching] }
        : { teaching: [classroom], enrolled: [] }
    );
  };

  const handleEnrolled = (classroom: Classroom) => {
    setData((prev) =>
      prev
        ? { ...prev, enrolled: [classroom, ...prev.enrolled] }
        : { teaching: [], enrolled: [classroom] }
    );
  };

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
                <span className="text-sm font-medium hidden sm:block">{displayName}</span>
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-24 sm:pt-28 pb-16 space-y-10 sm:space-y-12">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {displayName.split(" ")[0]} 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Here are all your classrooms.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => setClassCreateSheetOpen(true)}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white rounded-full px-4 sm:px-5 h-10 font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4 shrink-0" />
              New Classroom
            </Button>

            <Button
              onClick={() => setClassEnrollSheetOpen(true)}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-4 sm:px-5 h-10 font-semibold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm"
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              Enroll in Classroom
            </Button>
          </div>
        </div>

        {/* Error state */}
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

        {/* Content */}
        {!loading && data && (
          <>
            <section>
              <SectionHeader
                icon={BookOpen}
                title="Teaching"
                count={data.teaching.length}
                color="bg-blue-500/10 text-blue-500"
              />
              {data.teaching.length === 0 ? (
                <EmptyState label="teaching" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.teaching.map((c) => (
                    <ClassroomCard key={c.id} classroom={c} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <SectionHeader
                icon={GraduationCap}
                title="Enrolled"
                count={data.enrolled.length}
                color="bg-emerald-500/10 text-emerald-500"
              />
              {data.enrolled.length === 0 ? (
                <EmptyState label="enrolled" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.enrolled.map((c) => (
                    <ClassroomCard key={c.id} classroom={c} />
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
          <p>Advancing UN Sustainable Development Goal 4 · Quality Education for All</p>
          <p>© 2026 ClassMate</p>
        </div>
      </footer>

      <CreateClassroomSheet
        open={classCreateSheetOpen}
        onClose={() => setClassCreateSheetOpen(false)}
        onCreated={handleCreated}
      />

      <EnrollClassroomSheet
        open={classEnrollSheetOpen}
        onClose={() => setClassEnrollSheetOpen(false)}
        onEnrolled={handleEnrolled}
      />
    </div>
  );
}