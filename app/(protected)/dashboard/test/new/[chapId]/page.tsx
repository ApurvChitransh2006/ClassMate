"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  LogOut,
  User,
  ArrowLeft,
  Plus,
  Trash2,
  ClipboardList,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Clock,
  Star,
  Calendar,
} from "lucide-react";
import { signOut } from "next-auth/react";

// ── Types ──────────────────────────────────────────────
type Option = {
  text: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  text: string;
  options: Option[];
  expanded: boolean;
};

// ── Option Row ─────────────────────────────────────────
function OptionRow({
  option,
  index,
  questionId,
  onChange,
  onToggleCorrect,
  onDelete,
  canDelete,
}: {
  option: Option;
  index: number;
  questionId: string;
  onChange: (qId: string, oIdx: number, text: string) => void;
  onToggleCorrect: (qId: string, oIdx: number) => void;
  onDelete: (qId: string, oIdx: number) => void;
  canDelete: boolean;
}) {
  return (
    <div className="flex items-center gap-2 group/option">
      <button
        type="button"
        onClick={() => onToggleCorrect(questionId, index)}
        className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
          option.isCorrect
            ? "text-emerald-500 scale-110"
            : "text-muted-foreground/40 hover:text-muted-foreground"
        }`}
        title={option.isCorrect ? "Correct answer" : "Mark as correct"}
      >
        {option.isCorrect ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      <Input
        value={option.text}
        onChange={(e) => onChange(questionId, index, e.target.value)}
        placeholder={`Option ${String.fromCharCode(65 + index)}`}
        className={`flex-1 h-9 rounded-xl text-sm border transition-colors ${
          option.isCorrect
            ? "border-emerald-500/40 bg-emerald-500/5 focus-visible:ring-emerald-500/30"
            : "border-border bg-muted/30"
        }`}
      />

      <button
        type="button"
        onClick={() => onDelete(questionId, index)}
        disabled={!canDelete}
        className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover/option:opacity-100 ${
          canDelete
            ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-500"
            : "text-muted-foreground/20 cursor-not-allowed"
        }`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Question Card ──────────────────────────────────────
function QuestionCard({
  question,
  index,
  total,
  onUpdate,
  onDelete,
  onToggleExpand,
  onOptionChange,
  onOptionToggleCorrect,
  onOptionDelete,
  onAddOption,
}: {
  question: Question;
  index: number;
  total: number;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onOptionChange: (qId: string, oIdx: number, text: string) => void;
  onOptionToggleCorrect: (qId: string, oIdx: number) => void;
  onOptionDelete: (qId: string, oIdx: number) => void;
  onAddOption: (qId: string) => void;
}) {
  const correctCount = question.options.filter((o) => o.isCorrect).length;

  return (
    <Card
      className={`border rounded-2xl shadow-none transition-all duration-200 overflow-hidden ${
        question.expanded
          ? "border-indigo-500/30 bg-card shadow-sm shadow-indigo-500/10"
          : "border-border bg-card/60 hover:border-border/80"
      }`}
    >
      {/* Top accent */}
      <div className="h-0.5 w-full bg-linear-to-r from-indigo-500 to-blue-500" />

      <CardContent className="p-0">
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
          onClick={() => onToggleExpand(question.id)}
        >
          <div className="shrink-0 flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground/30" />
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
              {index + 1}
            </div>
          </div>

          <p className="flex-1 text-sm font-medium line-clamp-1 text-foreground/80">
            {question.text || (
              <span className="text-muted-foreground/50 italic">
                Untitled question...
              </span>
            )}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            {correctCount > 0 && (
              <Badge
                variant="outline"
                className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold"
              >
                {correctCount} correct
              </Badge>
            )}
            <Badge
              variant="outline"
              className="text-xs text-muted-foreground border-border bg-muted/30 px-2 py-0.5 rounded-full"
            >
              {question.options.length} opts
            </Badge>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(question.id);
              }}
              disabled={total <= 1}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                total > 1
                  ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-500"
                  : "text-muted-foreground/20 cursor-not-allowed"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {question.expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Body */}
        {question.expanded && (
          <div className="px-5 pb-5 space-y-4 border-t border-border/50 pt-4">
            {/* Question text */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                Question Text
              </label>
              <Textarea
                value={question.text}
                onChange={(e) => onUpdate(question.id, e.target.value)}
                placeholder="Enter your question here..."
                rows={2}
                className="rounded-xl bg-muted/30 border-border text-sm resize-none focus-visible:ring-indigo-500/30"
              />
            </div>

            {/* Options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                  Options
                </label>
                <span className="text-xs text-muted-foreground">
                  Click circle to mark correct
                </span>
              </div>

              <div className="space-y-2">
                {question.options.map((opt, oIdx) => (
                  <OptionRow
                    key={oIdx}
                    option={opt}
                    index={oIdx}
                    questionId={question.id}
                    onChange={onOptionChange}
                    onToggleCorrect={onOptionToggleCorrect}
                    onDelete={onOptionDelete}
                    canDelete={question.options.length > 2}
                  />
                ))}
              </div>

              {question.options.length < 6 && (
                <button
                  type="button"
                  onClick={() => onAddOption(question.id)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-indigo-500 transition-colors font-medium mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add option
                </button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Create Test Page ───────────────────────────────────
export default function CreateTestPage() {
  const { data: session, status } = useSession();
  const params = useParams<{ chapId: string }>();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<number | "">(30);
  const [totalMarks, setTotalMarks] = useState<number | "">(100);
  const [startTime, setStartTime] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: crypto.randomUUID(),
      text: "",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      expanded: true,
    },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (status === "unauthenticated") redirect("/login");

  const user = session?.user;
  const displayName = user?.name ?? "Unknown";

  // ── Question helpers ───────────────────────────────
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev.map((q) => ({ ...q, expanded: false })),
      {
        id: crypto.randomUUID(),
        text: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
        expanded: true,
      },
    ]);
  };

  const deleteQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const toggleExpand = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, expanded: !q.expanded } : q))
    );
  };

  const updateQuestionText = (id: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, text } : q))
    );
  };

  const handleOptionChange = (qId: string, oIdx: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((o, i) => (i === oIdx ? { ...o, text } : o)),
            }
          : q
      )
    );
  };

  const handleOptionToggleCorrect = (qId: string, oIdx: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((o, i) => ({
                ...o,
                isCorrect: i === oIdx ? !o.isCorrect : o.isCorrect,
              })),
            }
          : q
      )
    );
  };

  const handleOptionDelete = (qId: string, oIdx: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId && q.options.length > 2
          ? { ...q, options: q.options.filter((_, i) => i !== oIdx) }
          : q
      )
    );
  };

  const handleAddOption = (qId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId && q.options.length < 6
          ? { ...q, options: [...q.options, { text: "", isCorrect: false }] }
          : q
      )
    );
  };

  // ── Validation & Submit ────────────────────────────
  const handleSubmit = () => {
    setError(null);

    if (!title.trim() || title.trim().length < 2) {
      setError("Test title must be at least 2 characters.");
      return;
    }
    if (!duration || Number(duration) < 1) {
      setError("Duration must be at least 1 minute.");
      return;
    }
    if (!totalMarks || Number(totalMarks) < 1) {
      setError("Total marks must be at least 1.");
      return;
    }
    if (!startTime) {
      setError("Please select a start time.");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Question ${i + 1} has no text.`);
        return;
      }
      if (q.options.some((o) => !o.text.trim())) {
        setError(`Question ${i + 1} has empty options.`);
        return;
      }
      if (!q.options.some((o) => o.isCorrect)) {
        setError(`Question ${i + 1} has no correct answer marked.`);
        return;
      }
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || undefined,
            duration: Number(duration),
            totalMarks: Number(totalMarks),
            chapterId: params.chapId,
            startTime:  new Date(startTime).toISOString(),
            questions: questions.map((q) => ({
              text: q.text.trim(),
              options: q.options.map((o) => ({
                text: o.text.trim(),
                isCorrect: o.isCorrect,
              })),
            })),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Failed to create test.");
          return;
        }

        router.back();
      } catch {
        setError("Network error. Please try again.");
      }
    });
  };

  const completedQuestions = questions.filter(
    (q) => q.text.trim() && q.options.some((o) => o.isCorrect)
  ).length;

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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-100 bg-linear-to-b from-indigo-500/10 to-transparent rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-40 left-10 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-24 sm:pt-28 pb-16 space-y-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full -ml-2 px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chapter
        </button>

        {/* Page header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-500 shrink-0" />
            Create New Test
          </h1>
          <p className="text-muted-foreground text-sm">
            Build a test with questions and multiple-choice options for this chapter.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Details */}
            <Card className="border border-border rounded-2xl shadow-none">
              <div className="h-1 w-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-t-2xl" />
              <CardContent className="p-6 space-y-5">
                <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ClipboardList className="w-3.5 h-3.5" />
                  </div>
                  Test Details
                </h2>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                    Test Title <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Chapter 3 — Kinematics Quiz"
                    className="rounded-xl h-10 bg-muted/40 border-border text-sm"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                    Description{" "}
                    <span className="text-muted-foreground/50 normal-case font-normal">
                      (optional)
                    </span>
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of what this test covers..."
                    rows={2}
                    className="rounded-xl bg-muted/40 border-border text-sm resize-none"
                  />
                </div>

                {/* Duration + Total Marks */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Duration (mins) <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={duration}
                      onChange={(e) =>
                        setDuration(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      placeholder="30"
                      className="rounded-xl h-10 bg-muted/40 border-border text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Total Marks <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={totalMarks}
                      onChange={(e) =>
                        setTotalMarks(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      placeholder="100"
                      className="rounded-xl h-10 bg-muted/40 border-border text-sm"
                    />
                  </div>
                </div>

                {/* Start Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Start Time <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="rounded-xl h-10 bg-muted/40 border-border text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    End time will be calculated as start + duration
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <span className="text-xs font-black">Q</span>
                  </div>
                  Questions
                  <Badge
                    variant="outline"
                    className="text-xs text-indigo-600 dark:text-indigo-400 border-indigo-500/30 bg-indigo-500/10 rounded-full ml-1"
                  >
                    {questions.length}
                  </Badge>
                </h2>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors bg-indigo-500/10 hover:bg-indigo-500/15 px-3 py-1.5 rounded-full"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Question
                </button>
              </div>

              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    index={idx}
                    total={questions.length}
                    onUpdate={updateQuestionText}
                    onDelete={deleteQuestion}
                    onToggleExpand={toggleExpand}
                    onOptionChange={handleOptionChange}
                    onOptionToggleCorrect={handleOptionToggleCorrect}
                    onOptionDelete={handleOptionDelete}
                    onAddOption={handleAddOption}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={addQuestion}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-sm text-muted-foreground hover:text-indigo-500 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add another question
              </button>
            </div>
          </div>

          {/* Right: Summary + Submit */}
          <div className="space-y-4">
            {/* Progress summary */}
            <Card className="border border-border rounded-2xl shadow-none sticky top-24">
              <div className="h-1 w-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-t-2xl" />
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-bold tracking-tight">Summary</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Questions</span>
                    <span className="font-semibold">{questions.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Ready</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {completedQuestions} / {questions.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold">
                      {duration ? `${duration} min` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total Marks</span>
                    <span className="font-semibold">
                      {totalMarks ? totalMarks : "—"}
                    </span>
                  </div>
                  {startTime && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Starts</span>
                      <span className="font-semibold">
                        {new Date(startTime).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Completion</span>
                    <span>
                      {Math.round((completedQuestions / questions.length) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(completedQuestions / questions.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-600 dark:text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold shadow-md shadow-emerald-500/20 text-sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating…
                    </>
                  ) : (
                    "Create Test"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isPending}
                  className="w-full text-xs text-muted-foreground hover:text-foreground text-center transition-colors"
                >
                  Cancel
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
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
    </div>
  );
}