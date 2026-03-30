"use client";

import { useEffect, useState, useTransition, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Lightbulb,
  LogOut,
  User,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Send,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  Circle,
  Flag,
  Lock,
  Calendar,
  Trophy,
} from "lucide-react";
import { signOut } from "next-auth/react";

// ── Types ──────────────────────────────────────────────
type OptionData = { id: string; text: string };
type QuestionData = { id: string; text: string; options: OptionData[] };
type TestData = {
  id: string;
  title: string;
  description?: string | null;
  duration: number; // minutes
  totalMarks: number;
  startTime?: string | null;
  endTime?: string | null;
  questions: QuestionData[];
};
type QuestionStatus = "attempted" | "flagged" | "unattempted";

// ── Countdown Hook ─────────────────────────────────────
// Accepts a live `seconds` value derived from (endTime - now).
// We just display it and call onExpire when it hits 0.
function useTimerDisplay(seconds: number, onExpire: () => void) {
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  // ✅ move mutation here
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (seconds <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      setTimeout(() => onExpireRef.current(), 0);
    }

    if (seconds > 0) {
      expiredRef.current = false;
    }
  }, [seconds]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return {
    display:
      h > 0
        ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
    isWarning: seconds > 0 && seconds <= 300,
    isCritical: seconds > 0 && seconds <= 60,
  };
}

// ── Not Started Screen ─────────────────────────────────
function NotStartedScreen({
  test,
  secondsUntil,
}: {
  test: TestData;
  secondsUntil: number;
}) {
  const h = Math.floor(secondsUntil / 3600);
  const m = Math.floor((secondsUntil % 3600) / 60);
  const s = secondsUntil % 60;
  const countdownDisplay =
    h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;

  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <Lock className="w-10 h-10 text-amber-500" />
      </div>

      <div className="text-center space-y-2 max-w-md">
        <h1 className="text-2xl font-extrabold tracking-tight">{test.title}</h1>
        <p className="text-muted-foreground text-sm">
          This test hasn&apos;t started yet. Please wait until the scheduled time.
        </p>
      </div>

      <Card className="border border-amber-500/30 rounded-3xl shadow-none overflow-hidden w-full max-w-sm">
        <div className="h-1 w-full bg-linear-to-r from-amber-500 to-orange-500" />
        <CardContent className="p-6 space-y-4">
          {test.startTime && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Starts at</p>
                <p className="text-sm font-bold">
                  {new Date(test.startTime).toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-bold">{test.duration} minutes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Marks</p>
              <p className="text-sm font-bold">{test.totalMarks}</p>
            </div>
          </div>

          {secondsUntil > 0 && (
            <div className="pt-2 border-t border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Opens in</p>
              <p className="text-2xl font-black tabular-nums text-amber-600 dark:text-amber-400">
                {countdownDisplay}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Ended Screen ───────────────────────────────────────
function EndedScreen({ test }: { test: TestData }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
        <XCircle className="w-10 h-10 text-rose-500" />
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h1 className="text-2xl font-extrabold tracking-tight">{test.title}</h1>
        <p className="text-muted-foreground text-sm">
          This test has ended. The submission window is closed.
        </p>
        {test.endTime && (
          <p className="text-xs text-muted-foreground">
            Ended at {new Date(test.endTime).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Confirm Submit Modal ───────────────────────────────
function ConfirmModal({
  attempted,
  flagged,
  total,
  onConfirm,
  onCancel,
  submitting,
}: {
  attempted: number;
  flagged: number;
  total: number;
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const unattempted = total - attempted - flagged;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight">Submit Test?</h2>
          <p className="text-sm text-muted-foreground">
            You won&apos;t be able to change your answers after submitting.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm py-2.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Attempted
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{attempted}</span>
          </div>
          {flagged > 0 && (
            <div className="flex items-center justify-between text-sm py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
                <Flag className="w-4 h-4" /> Review Later
              </span>
              <span className="font-bold text-amber-700 dark:text-amber-400">{flagged}</span>
            </div>
          )}
          {unattempted > 0 && (
            <div className="flex items-center justify-between text-sm py-2.5 px-3 rounded-xl bg-muted border border-border">
              <span className="flex items-center gap-2 font-medium text-muted-foreground">
                <Circle className="w-4 h-4" /> Unattempted
              </span>
              <span className="font-bold text-muted-foreground">{unattempted}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-full font-semibold border-border"
            onClick={onCancel}
            disabled={submitting}
          >
            Go Back
          </Button>
          <Button
            className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold shadow-md shadow-emerald-500/20"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Submit
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function TestPage() {
  const { data: session, status } = useSession();
  const params = useParams<{ testId: string }>();
  const router = useRouter();

  const [test, setTest] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startSubmit] = useTransition();

  if (status === "unauthenticated") redirect("/login");

  const user = session?.user;
  const displayName = user?.name ?? "Unknown";

  // Fetch test
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/test/${params.testId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load test");
        return r.json();
      })
      .then(setTest)
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [status, params.testId]);

  // ── Single clock that ticks every second ─────────────
  // Everything derives from this — no separate countdown state to go stale.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Derived timing values (recomputed every second automatically)
  const startMs = test?.startTime ? new Date(test.startTime).getTime() : null;
  const endMs = test?.endTime ? new Date(test.endTime).getTime() : null;

  const hasStarted = startMs !== null ? now >= startMs : true;
  const hasEnded = endMs !== null ? now >= endMs : false;
  const testActive = hasStarted && !hasEnded;

  // Seconds until test starts (for the "not started" countdown)
  const secondsUntilStart = startMs !== null ? Math.max(0, Math.floor((startMs - now) / 1000)) : 0;

  // Seconds remaining on the test timer
  const timerSeconds = (() => {
    if (!test || !testActive) return 0;
    if (endMs !== null) return Math.max(0, Math.floor((endMs - now) / 1000));
    return Math.max(0, test.duration * 60); // fallback if no endTime
  })();

  const handleExpire = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const { display: timerDisplay, isWarning, isCritical } = useTimerDisplay(
    timerSeconds,
    handleExpire
  );

  // ── Question helpers ──────────────────────────────────
  const totalQ = test?.questions.length ?? 0;
  const currentQ = test?.questions[current];

  const getStatus = (qId: string): QuestionStatus => {
    if (answers[qId]) return "attempted";
    if (flagged.has(qId)) return "flagged";
    return "unattempted";
  };

  const handleSelect = (optionId: string) => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionId }));
  };

  const toggleFlag = () => {
    if (!currentQ) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) next.delete(currentQ.id);
      else next.add(currentQ.id);
      return next;
    });
  };

  const attemptedCount = Object.keys(answers).length;
  const flaggedCount = flagged.size;

  const handleSubmit = () => {
    if (!test) return;
    startSubmit(async () => {
      try {
        const payload = test.questions
          .filter((q) => answers[q.id])
          .map((q) => ({ questionId: q.id, optionId: answers[q.id] }));

        const res = await fetch(`/api/test/${params.testId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: payload }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSubmitError(data.error ?? "Submission failed.");
          setShowConfirm(false);
          return;
        }
        router.push(`/dashboard/result/${params.testId}`);
      } catch {
        setSubmitError("Network error. Please try again.");
        setShowConfirm(false);
      }
    });
  };

  // ── Render ────────────────────────────────────────────
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
            {/* Timer — only when test is active */}
            {test && testActive && (
              <div
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full border font-mono font-bold text-sm tabular-nums transition-colors ${
                  isCritical
                    ? "border-rose-500/50 bg-rose-500/10 text-rose-500 animate-pulse"
                    : isWarning
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "border-border bg-muted/40 text-foreground"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {timerDisplay}
              </div>
            )}

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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-100 bg-linear-to-b from-indigo-500/10 to-transparent rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <ConfirmModal
          attempted={attemptedCount}
          flagged={flaggedCount}
          total={totalQ}
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirm(false)}
          submitting={isPending}
        />
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-24 pb-16">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Fetch error */}
        {loadError && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-600 dark:text-rose-400 mt-8">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {loadError}
          </div>
        )}

        {/* Not started yet */}
        {!loading && test && !hasStarted && (
          <NotStartedScreen test={test} secondsUntil={secondsUntilStart} />
        )}

        {/* Test has ended */}
        {!loading && test && hasStarted && hasEnded && (
          <EndedScreen test={test} />
        )}

        {/* Active test UI */}
        {!loading && test && testActive && (
          <div className="flex flex-col lg:flex-row gap-6 mt-4">
            {/* Left: Question Area */}
            <div className="flex-1 space-y-6">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">{test.title}</h1>
                <p className="text-xs text-muted-foreground">
                  {test.duration} mins · {test.totalMarks} marks · {totalQ} questions
                </p>
              </div>

              {submitError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError}
                </div>
              )}

              {currentQ && (
                <Card className="border border-border rounded-3xl shadow-none overflow-hidden">
                  <div className="h-1 w-full bg-linear-to-r from-indigo-500 to-blue-500" />
                  <CardContent className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">
                          {current + 1}
                        </div>
                        <p className="text-base sm:text-lg font-semibold leading-relaxed pt-0.5">
                          {currentQ.text}
                        </p>
                      </div>

                      <button
                        onClick={toggleFlag}
                        className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                          flagged.has(currentQ.id)
                            ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "border-border text-muted-foreground hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-600"
                        }`}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {flagged.has(currentQ.id) ? "Flagged" : "Flag"}
                        </span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {currentQ.options.map((opt, idx) => {
                        const isSelected = answers[currentQ.id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelect(opt.id)}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all duration-150 ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-500/10 shadow-sm shadow-indigo-500/10"
                                : "border-border bg-muted/20 hover:border-indigo-500/40 hover:bg-muted/40"
                            }`}
                          >
                            <div
                              className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                                isSelected
                                  ? "border-indigo-500 bg-indigo-500 text-white"
                                  : "border-border text-muted-foreground"
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-foreground"}`}>
                              {opt.text}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 ml-auto text-indigo-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrent((p) => Math.max(0, p - 1))}
                  disabled={current === 0}
                  className="flex items-center gap-2 rounded-full px-5 h-10 font-semibold border-border hover:bg-muted/60"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <span className="text-xs text-muted-foreground font-medium tabular-nums">
                  {current + 1} / {totalQ}
                </span>

                {current < totalQ - 1 ? (
                  <Button
                    onClick={() => setCurrent((p) => Math.min(totalQ - 1, p + 1))}
                    className="flex items-center gap-2 rounded-full px-5 h-10 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowConfirm(true)}
                    className="flex items-center gap-2 rounded-full px-5 h-10 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  >
                    <Send className="w-4 h-4" /> Submit
                  </Button>
                )}
              </div>
            </div>

            {/* Right: Question Palette */}
            <div className="lg:w-72 shrink-0">
              <Card className="border border-border rounded-3xl shadow-none sticky top-24 overflow-hidden">
                <div className="h-1 w-full bg-linear-to-r from-blue-500 to-indigo-500" />
                <CardContent className="p-5 space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold tracking-tight">Question Palette</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{attemptedCount}</span>{" "}
                      answered ·{" "}
                      {flaggedCount > 0 && (
                        <>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">{flaggedCount}</span> flagged ·{" "}
                        </>
                      )}
                      <span>{totalQ - attemptedCount - flaggedCount}</span> left
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${totalQ > 0 ? (attemptedCount / totalQ) * 100 : 0}%` }}
                    />
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-6 gap-1.5">
                    {test.questions.map((q, idx) => {
                      const st = getStatus(q.id);
                      const isCurrent = idx === current;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrent(idx)}
                          className={`w-full aspect-square rounded-lg text-xs font-bold transition-all duration-150 border-2 ${
                            isCurrent
                              ? "border-indigo-500 bg-indigo-500 text-white scale-110 shadow-md shadow-indigo-500/30"
                              : st === "attempted"
                              ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:scale-105"
                              : st === "flagged"
                              ? "border-amber-500/60 bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:scale-105"
                              : "border-border bg-muted/30 text-muted-foreground hover:scale-105"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="space-y-1.5 pt-1 border-t border-border">
                    {[
                      { color: "bg-indigo-500 border-indigo-500", label: "Current" },
                      { color: "bg-emerald-500/20 border-emerald-500/50", label: "Answered" },
                      { color: "bg-amber-500/20 border-amber-500/50", label: "Review later" },
                      { color: "bg-muted border-border", label: "Not answered" },
                    ].map(({ color, label }) => (
                      <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className={`w-3.5 h-3.5 rounded border shrink-0 ${color}`} />
                        {label}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => setShowConfirm(true)}
                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold shadow-md shadow-emerald-500/20 text-sm"
                  >
                    <BookmarkCheck className="w-4 h-4 mr-2" />
                    Submit Test
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
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