"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Lightbulb,
  LogOut,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trophy,
  ClipboardList,
  ArrowLeft,
  Users,
  ChevronDown,
  ChevronUp,
  Clock,
  Star,
} from "lucide-react";
import { signOut } from "next-auth/react";

// ── Types ──────────────────────────────────────────────
type AnswerBreakdown = {
  questionId: string;
  questionText: string;
  chosenOptionId: string;
  chosenOptionText: string;
  isCorrect: boolean;
  correctOptionId?: string | null;
  correctOptionText?: string | null;
};

// Student result shape
type StudentResult = {
  testId: string;
  title: string;
  description?: string | null;
  totalMarks: number;
  duration: number;
  attemptId: string;
  submittedAt: string;
  score: number;
  correct: number;
  total: number;
  percentage: number;
  breakdown: AnswerBreakdown[];
};

// Teacher/admin — one attempt entry
type AttemptEntry = {
  attemptId: string;
  submittedAt: string;
  student: { id: string; name?: string | null; email: string; image?: string | null };
  score: number | null;
  totalMarks: number;
  correct: number;
  total: number;
  percentage: number;
  answers: AnswerBreakdown[];
};

// Teacher/admin result shape
type TeacherResult = {
  testId: string;
  title: string;
  totalMarks: number;
  duration: number;
  startTime?: string | null;
  endTime?: string | null;
  totalAttempts: number;
  attempts: AttemptEntry[];
};

type ResultData = StudentResult | TeacherResult;

function isTeacherResult(r: ResultData): r is TeacherResult {
  return "attempts" in r;
}

// ── Score Ring ─────────────────────────────────────────
function ScoreRing({ percentage }: { percentage: number }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (percentage / 100) * circ;

  const color =
    percentage >= 75
      ? "#10b981"
      : percentage >= 50
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black" style={{ color }}>{percentage}%</span>
        <span className="text-xs text-muted-foreground font-medium">Score</span>
      </div>
    </div>
  );
}

// ── Question Review Card ───────────────────────────────
function QuestionReviewCard({
  item,
  index,
}: {
  item: AnswerBreakdown;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card
      className={`border rounded-2xl shadow-none overflow-hidden transition-all duration-200 ${
        item.isCorrect
          ? "border-emerald-500/30"
          : "border-rose-500/30"
      }`}
    >
      <div className={`h-1 w-full ${item.isCorrect ? "bg-linear-to-r from-emerald-500 to-teal-500" : "bg-linear-to-r from-rose-500 to-red-500"}`} />
      <CardContent className="p-0">
        <div
          className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
          onClick={() => setOpen((p) => !p)}
        >
          <div
            className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
              item.isCorrect
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}
          >
            {index + 1}
          </div>
          <p className="flex-1 text-sm font-medium line-clamp-1">{item.questionText}</p>
          <div className="flex items-center gap-2 shrink-0">
            {item.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-500" />
            )}
            {open ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {open && (
          <div className="px-5 pb-5 space-y-3 border-t border-border/50 pt-4">
            {/* Your answer */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Answer</span>
              <div
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium ${
                  item.isCorrect
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                }`}
              >
                {item.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                {item.chosenOptionText}
              </div>
            </div>

            {/* Correct answer (if wrong) */}
            {!item.isCorrect && item.correctOptionText && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Correct Answer</span>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {item.correctOptionText}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Student Result Attempt Card (teacher view) ─────────
function StudentAttemptCard({ attempt }: { attempt: AttemptEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="border border-border rounded-2xl shadow-none overflow-hidden">
      <div
        className={`h-1 w-full ${
          attempt.percentage >= 75
            ? "bg-linear-to-r from-emerald-500 to-teal-500"
            : attempt.percentage >= 50
            ? "bg-linear-to-r from-amber-500 to-orange-500"
            : "bg-linear-to-r from-rose-500 to-red-500"
        }`}
      />
      <CardContent className="p-0">
        <div
          className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
          onClick={() => setOpen((p) => !p)}
        >
          {/* Avatar */}
          <div className="shrink-0">
            {attempt.student.image ? (
              <Image
                src={attempt.student.image}
                alt={attempt.student.name ?? ""}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{attempt.student.name ?? "Unknown"}</p>
            <p className="text-xs text-muted-foreground truncate">{attempt.student.email}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-sm font-black">
                {attempt.score ?? 0}/{attempt.totalMarks}
              </p>
              <p className="text-xs text-muted-foreground">{attempt.percentage}%</p>
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                attempt.percentage >= 75
                  ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                  : attempt.percentage >= 50
                  ? "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10"
                  : "text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10"
              }`}
            >
              {attempt.correct}/{attempt.total}
            </Badge>
            {open ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {open && (
          <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-2">
            <p className="text-xs text-muted-foreground mb-3">
              Submitted {new Date(attempt.submittedAt).toLocaleString()}
            </p>
            {attempt.answers.map((ans, idx) => (
              <QuestionReviewCard key={ans.questionId} item={ans} index={idx} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function ResultPage() {
  const { data: session, status } = useSession();
  const params = useParams<{ testId: string }>();

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (status === "unauthenticated") redirect("/login");

  const user = session?.user;
  const displayName = user?.name ?? "Unknown";

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/result/${params.testId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load results");
        return r.json();
      })
      .then((data) => setResult(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status, params.testId]);

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
                  <Image src={user.image} alt={displayName} width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
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
              className="flex items-center gap-2 rounded-full border-border hover:bg-muted/60 font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-100 bg-linear-to-b from-emerald-500/10 to-transparent rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-30" />
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-24 pb-16 space-y-8">
        {/* Back */}
        <button
          onClick={() => router.push(`/dashboard`)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors -ml-2 px-2 py-1 rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ── STUDENT VIEW ── */}
        {!loading && result && !isTeacherResult(result) && (
          <>
            {/* Hero result card */}
            <Card className="border border-border rounded-3xl shadow-none overflow-hidden">
              <div
                className={`h-1.5 w-full ${
                  result.percentage >= 75
                    ? "bg-linear-to-r from-emerald-500 to-teal-500"
                    : result.percentage >= 50
                    ? "bg-linear-to-r from-amber-500 to-orange-500"
                    : "bg-linear-to-r from-rose-500 to-red-500"
                }`}
              />
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  {/* Ring */}
                  <ScoreRing percentage={result.percentage} />

                  {/* Info */}
                  <div className="flex-1 space-y-4 text-center sm:text-left">
                    <div>
                      <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Result</span>
                      </div>
                      <h1 className="text-2xl font-extrabold tracking-tight">{result.title}</h1>
                      {result.description && (
                        <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Score", value: `${result.score}/${result.totalMarks}`, icon: Star, color: "text-amber-500" },
                        { label: "Correct", value: `${result.correct}/${result.total}`, icon: CheckCircle2, color: "text-emerald-500" },
                        { label: "Wrong", value: `${result.total - result.correct}`, icon: XCircle, color: "text-rose-500" },
                        { label: "Duration", value: `${result.duration}m`, icon: Clock, color: "text-indigo-500" },
                      ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="flex flex-col items-center sm:items-start gap-1 px-3 py-3 rounded-2xl bg-muted/30 border border-border">
                          <Icon className={`w-4 h-4 ${color}`} />
                          <span className="text-lg font-black">{value}</span>
                          <span className="text-xs text-muted-foreground">{label}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(result.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-500">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Question Breakdown</h2>
                  <p className="text-xs text-muted-foreground">Click a question to see details</p>
                </div>
              </div>

              <div className="space-y-3">
                {result.breakdown.map((item, idx) => (
                  <QuestionReviewCard key={item.questionId} item={item} index={idx} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── TEACHER / ADMIN VIEW ── */}
        {!loading && result && isTeacherResult(result) && (
          <>
            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-emerald-500 shrink-0" />
                {result.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {result.duration} mins · {result.totalMarks} marks
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Attempts",
                  value: result.totalAttempts,
                  color: "from-blue-500 to-indigo-500",
                  icon: Users,
                },
                {
                  label: "Avg Score",
                  value: result.totalAttempts
                    ? `${Math.round(
                        result.attempts.reduce((a, b) => a + (b.score ?? 0), 0) /
                          result.totalAttempts
                      )}/${result.totalMarks}`
                    : "—",
                  color: "from-emerald-500 to-teal-500",
                  icon: Star,
                },
                {
                  label: "Pass Rate",
                  value: result.totalAttempts
                    ? `${Math.round(
                        (result.attempts.filter((a) => a.percentage >= 50).length /
                          result.totalAttempts) *
                          100
                      )}%`
                    : "—",
                  color: "from-amber-500 to-orange-500",
                  icon: Trophy,
                },
                {
                  label: "Total Marks",
                  value: result.totalMarks,
                  color: "from-rose-500 to-pink-500",
                  icon: Star,
                },
              ].map(({ label, value, color, icon: Icon }) => (
                <Card key={label} className="border border-border rounded-2xl shadow-none overflow-hidden">
                  <div className={`h-1 w-full bg-linear-to-r ${color}`} />
                  <CardContent className="p-4 space-y-1">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <p className="text-2xl font-black">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Attempts list */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Student Attempts</h2>
                  <p className="text-xs text-muted-foreground">
                    {result.totalAttempts} student{result.totalAttempts !== 1 ? "s" : ""} attempted
                  </p>
                </div>
              </div>

              {result.attempts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-2xl bg-muted/20">
                  <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center mb-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No attempts yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.attempts.map((attempt) => (
                    <StudentAttemptCard key={attempt.attemptId} attempt={attempt} />
                  ))}
                </div>
              )}
            </div>
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
    </div>
  );
}