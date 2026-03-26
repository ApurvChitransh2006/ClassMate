"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  BookOpen,
  ArrowLeft,
  Loader2,
  User,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { MoreVertical, Trash2, Pencil } from "lucide-react";

// ── Types ──────────────────────────────────────────────
type Teacher = {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
};

type Subject = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  teacher: Teacher;
};

type Student = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  joinedAt: string;
};

interface AddSubjectSheetProps {
  classroomId: string;
  open: boolean;
  onClose: () => void;
  onSubjectAdded: (subject: Subject) => void;
}

interface AddStudentsDialogProps {
  classroomId: string;
  open: boolean;
  onClose: () => void;
}

// ── Teacher Avatar ─────────────────────────────────────
function TeacherAvatar({ teacher }: { teacher: Teacher }) {
  const name = teacher.name ?? teacher.email;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return teacher.image ? (
    <Image
      src={teacher.image}
      alt={name}
      width={28}
      height={28}
      className="w-7 h-7 rounded-full object-cover ring-2 ring-background"
    />
  ) : (
    <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-background">
      {initials}
    </div>
  );
}

// ── Subject Card ───────────────────────────────────────
function SubjectCard({
  classroomId,
  subject,
  index,
  isAdmin,
  onEdit,
  onDelete,
}: {
  classroomId: string;
  subject: Subject;
  index: number;
  isAdmin: boolean;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
}) {
  const colors = [
    {
      accent: "from-blue-500 via-indigo-500 to-purple-500",
      glow: "hover:shadow-blue-500/20",
      icon: "bg-blue-500/15 text-blue-600",
      tint: "hover:bg-blue-500/[0.03]",
      cta: "hover:text-blue-600",
    },
    {
      accent: "from-violet-500 via-purple-500 to-fuchsia-500",
      glow: "hover:shadow-violet-500/20",
      icon: "bg-violet-500/15 text-violet-600",
      tint: "hover:bg-violet-500/[0.03]",
      cta: "hover:text-violet-600",
    },
    {
      accent: "from-emerald-500 via-teal-500 to-cyan-500",
      glow: "hover:shadow-emerald-500/20",
      icon: "bg-emerald-500/15 text-emerald-600",
      tint: "hover:bg-emerald-500/[0.03]",
      cta: "hover:text-emerald-600",
    },
    {
      accent: "from-amber-500 via-orange-500 to-red-500",
      glow: "hover:shadow-orange-500/20",
      icon: "bg-orange-500/15 text-orange-600",
      tint: "hover:bg-orange-500/[0.03]",
      cta: "hover:text-orange-600",
    },
    {
      accent: "from-rose-500 via-pink-500 to-fuchsia-500",
      glow: "hover:shadow-pink-500/20",
      icon: "bg-pink-500/15 text-pink-600",
      tint: "hover:bg-pink-500/[0.03]",
      cta: "hover:text-pink-600",
    },
    {
      accent: "from-cyan-500 via-sky-500 to-blue-500",
      glow: "hover:shadow-cyan-500/20",
      icon: "bg-cyan-500/15 text-cyan-600",
      tint: "hover:bg-cyan-500/[0.03]",
      cta: "hover:text-cyan-600",
    },
  ];

  const color = colors[index % colors.length];

  return (
    <div
      className={`group relative rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${color.glow} ${color.tint}`}
    >
      {isAdmin && (
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              {/* EDIT (placeholder) */}

              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => onEdit(subject)}
              >
                <Pencil className="w-4 h-4" />
                Edit
              </DropdownMenuItem>

              {/* DELETE */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                    onSelect={(e) => e.preventDefault()} // prevent auto close issue
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the subject.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-500"
                      onClick={() => onDelete(subject.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      {/* PERFECT TOP linear (fixed) */}
      <div className="absolute inset-x-0 top-0 h-0.75 overflow-hidden">
        <div className={`h-full w-full bg-linear-to-r ${color.accent}`} />
      </div>

      {/* CONTENT */}
      <div className="p-5 pt-6 flex flex-col justify-between h-full space-y-5">
        {/* HEADER */}
        <div className="flex items-start gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${color.icon}`}
          >
            <BookOpen className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold leading-snug line-clamp-1">
              {subject.name}
            </h3>

            <p className="text-xs text-muted-foreground mt-1">
              {new Date(subject.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* DESCRIPTION */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {subject.description}
        </p>

        {/* FOOTER */}
        <div className="flex items-center justify-between pt-2">
          {/* Teacher */}
          <div className="flex items-center gap-2 min-w-0">
            <TeacherAvatar teacher={subject.teacher} />

            <div className="truncate">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Teacher
              </p>
              <p className="text-xs font-medium truncate">
                {subject.teacher.name ?? subject.teacher.email}
              </p>
            </div>
          </div>

          {/* CTA */}
          <Link href={`/dashboard/classroom/${classroomId}/subject/${subject.id}`}>
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 px-3 text-xs rounded-xl transition-all opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 ${color.cta}`}
            >
              Open →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────
function EmptySubjects() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl bg-muted/20">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <GraduationCap className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-muted-foreground">
        No subjects yet
      </p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        Subjects will appear here once your teacher adds them.
      </p>
    </div>
  );
}

function AddSubjectSheet({
  classroomId,
  open,
  onClose,
  onSubjectAdded,
}: AddSubjectSheetProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teacherMail, setTeacherMail] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const res = await fetch(`/api/subject/class/${classroomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classroomId,
          name,
          description,
          teacherMail,
        }),
      });

      const data = await res.json();
         
      if (!res.ok) {
        setError(data.error || "Failed to create subject");
        return;
      }

      setName("");
      setDescription("");
      setTeacherMail("");
      onSubjectAdded(data.subject);
      onClose();
    } catch  {
      setError("Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-border flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-violet-500" />
          </div>

          <div>
            <SheetTitle className="text-lg font-semibold">
              Create Subject
            </SheetTitle>
            <SheetDescription className="text-sm mt-1">
              Add a new subject to this classroom. Only admins can perform this
              action.
            </SheetDescription>
          </div>
        </div>

        {/* BODY */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Subject Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject Name</label>
            <Input
              placeholder="e.g. Mathematics 101"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              className="h-11 rounded-xl"
            />
          </div>

          {/* Teacher's ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Teacher&apos;s Mail</label>
            <Input
              placeholder="e.g. teacher@mail.com"
              value={teacherMail}
              onChange={(e) => setTeacherMail(e.target.value)}
              disabled={isPending}
              className="h-11 rounded-xl"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Briefly describe what this subject covers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              rows={4}
              className="rounded-xl resize-none"
            />
          </div>

          {/* Optional UX improvement */}
          <div className="text-xs text-muted-foreground">
            This will be visible to all students in the classroom.
          </div>
        </form>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-border flex gap-3 bg-background">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl h-11"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 rounded-xl h-11 bg-violet-600 hover:bg-violet-500"
            disabled={isPending}
          >
            {isPending ? (
              <div>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating...
              </div>
            ) : (
              "Create Subject"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Add Students ───────────────────────────────────────
function AddStudentsDialog({
  classroomId,
  open,
  onClose,
}: AddStudentsDialogProps) {
  const [emails, setEmails] = useState("");
  const [addingStudents, setAddingStudents] = useState(false);
  const [studentError, setStudentError] = useState("");

  const handleAddStudents = async () => {
    setStudentError("");
    setAddingStudents(true);

    try {
      const res = await fetch(`/api/class/${classroomId}/add-students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emails }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStudentError(data.error || "Failed to add students");
        return;
      }

      // ✅ reset + close
      setEmails("");
      onClose();

      // optional feedback
      console.log(data);
    } catch {
      setStudentError("Something went wrong");
    } finally {
      setAddingStudents(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Students</DialogTitle>
          <DialogDescription>
            Enter emails separated by commas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {studentError && (
            <div className="text-sm text-red-500 bg-red-500/10 p-2 rounded-lg">
              {studentError}
            </div>
          )}

          <Textarea
            placeholder="e.g. student1@gmail.com, student2@gmail.com"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            rows={4}
          />

          <Button
            onClick={handleAddStudents}
            disabled={addingStudents}
            className="w-full bg-violet-600 hover:bg-violet-500"
          >
            {addingStudents ? (
              <div>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Adding...
              </div>
            ) : (
              "Add Students"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Students Sheet ─────────────────────────────────────
function StudentsSheet({
  classroomId,
  open,
  onClose,
}: {
  classroomId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // ✅ FETCH FUNCTION
  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log("Fetching students...");
      
      const res = await fetch(`/api/class/${classroomId}/students`); // ✅ FIXED
      const data = await res.json();

      setStudents(data.students || []);
    } catch (err) {
      console.error(err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  if (open && students.length === 0 && !loading) {
    fetchStudents();
  }

  // ✅ REMOVE STUDENT
  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(
        `/api/class/${classroomId}/remove-student`, // ✅ FIXED
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: id }),
        },
      );

      if (!res.ok) return;

      // instant UI update
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Sheet
        open={open}
        onOpenChange={(value) => {
          if (value) {
            fetchStudents();
          } else {
            onClose();
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          {/* HEADER */}
          <div className="px-6 py-5 border-b flex items-center justify-between">
            <div>
              <SheetTitle>Students</SheetTitle>
              <SheetDescription>Manage classroom students</SheetDescription>
            </div>

            <Button
              size="sm"
              onClick={() => setAddOpen(true)}
              className="bg-violet-600 hover:bg-violet-500"
            >
              + Add
            </Button>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">
                No students found
              </p>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-xl border"
                >
                  <div className="flex items-center gap-3">
                    <TeacherAvatar teacher={student} />
                    <div>
                      <p className="text-sm font-medium">
                        {student.name ?? "Unnamed"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-500 flex items-center gap-2"
                      >
                        {/* Mobile (icon only) */}
                        <Trash2 className="w-4 h-4 sm:hidden" />

                        {/* Desktop (text) */}
                        <span className="hidden sm:inline">Remove</span>
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Student?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the student from the classroom.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-500"
                          onClick={() => handleRemove(student.id)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Students Dialog */}
      <AddStudentsDialog
        classroomId={classroomId}
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
    </div>
  );
}

// ── Edit Students Sheet ────────────────────────────────
function EditSubjectSheet({
  subject,
  open,
  onClose,
  onUpdated,
}: {
  subject: Subject | null;
  open: Subject | null;
  onClose: () => void;
  onUpdated: (subject: Subject) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teacherMail, setTeacherMail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ initialize when opening
  if (subject && name === "") {
    setName(subject.name);
    setDescription(subject.description);
    setTeacherMail(subject.teacher.email);
  }

  const handleSubmit = async () => {
    if (!subject) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/subject/${subject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          teacherMail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update");
        return;
      }

      onUpdated(data.subject);
      onClose();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open ? true : false} >
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">

        {/* HEADER */}
        <div className="px-6 py-5 border-b">
          <SheetTitle>Edit Subject</SheetTitle>
          <SheetDescription>
            Update subject details
          </SheetDescription>
        </div>

        {/* BODY */}
        <div className="flex-1 px-6 py-6 space-y-5">

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 p-2 rounded-lg">
              {error}
            </div>
          )}

          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Subject name"
          />

          <Input
            value={teacherMail}
            onChange={(e) => setTeacherMail(e.target.value)}
            placeholder="Teacher email"
          />

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>

          <Button
            className="flex-1 bg-violet-600 hover:bg-violet-500"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}


// ── Page ───────────────────────────────────────────────
export default function ClassroomPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const classroomId = params?.classId as string;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);

  const [error, setError] = useState<string | null>(null);

  if (status === "unauthenticated") redirect("/login");

  const user = session?.user;
  const displayName = user?.name ?? "Unknown";

  useEffect(() => {
    if (!classroomId) return;

    fetch(`/api/class/is-admin/${classroomId}`)
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.isAdmin))
      .catch(() => setIsAdmin(false));
  }, [classroomId]);

  useEffect(() => {
    if (status !== "authenticated" || !classroomId) return;

    fetch(`/api/subject/class/${classroomId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load subjects");
        return r.json();
      })
      .then((d) => setSubjects(d.subjects))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status, classroomId]);

  const handleSubjectAdded = (subject: Subject) => {
    setSubjects((prev) => [subject, ...prev]);
  };

  const handleSubjectUpdated = (updated: Subject) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/subject/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error("Failed to delete");
        return;
      }

      // remove from UI instantly
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">
              Class<span className="text-blue-500">Mate</span>
            </span>
          </Link>

          {/* Right: Avatar + Sign out */}
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
                <span className="text-sm font-medium hidden sm:block">
                  {displayName}
                </span>
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-100 bg-linear-to-b from-blue-500/10 to-transparent rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-40 left-10 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-24 sm:pt-28 pb-16 space-y-8">
        {/* Back + Page header */}
        <div className="space-y-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground rounded-full -ml-2 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Classroom Subjects
              </h1>

              <p className="text-sm text-muted-foreground">
                Manage and explore all subjects in this classroom
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 rounded-md bg-muted border">
                  ID: {classroomId}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!loading && (
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-xs font-semibold rounded-full border-border bg-muted/40"
                >
                  {subjects.length} subject{subjects.length !== 1 ? "s" : ""}
                </Badge>
              )}

              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setStudentsOpen(true)}
                    variant="outline"
                    className="rounded-full"
                  >
                    Students
                  </Button>

                  <Button
                    onClick={() => setAddSubjectOpen(true)}
                    className="rounded-full bg-violet-600 hover:bg-violet-500"
                  >
                    + Add Subject
                  </Button>
                </div>
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

        {/* Subjects grid */}
        {!loading &&
          !error &&
          (subjects.length === 0 ? (
            <EmptySubjects />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject, i) => (
                <SubjectCard
                  classroomId={classroomId}
                  key={subject.id}
                  subject={subject}
                  index={i}
                  isAdmin={isAdmin}
                  onEdit={(subject) => setEditSubject(subject)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ))}
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
          <p>
            Advancing UN Sustainable Development Goal 4 · Quality Education for
            All
          </p>
          <p>© 2026 ClassMate</p>
        </div>
      </footer>

      <EditSubjectSheet
        subject={editSubject}
        open={editSubject}
        onClose={() => setEditSubject(null)}
        onUpdated={handleSubjectUpdated}
      />
      <StudentsSheet
        classroomId={classroomId}
        open={studentsOpen}
        onClose={() => setStudentsOpen(false)}
      />
      <AddSubjectSheet
        classroomId={classroomId}
        open={addSubjectOpen}
        onClose={() => setAddSubjectOpen(false)}
        onSubjectAdded={handleSubjectAdded}
      />
    </div>
  );
}
