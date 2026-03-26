"use client"

import { signOut, useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Lightbulb, Mail, CalendarDays, ArrowRight, ShieldCheck, LogOut } from "lucide-react"

function AvatarFallback({ name }: { name: string }) {
  const isUnknown = name === "Unknown"

  const initials = isUnknown
    ? "?"
    : name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()

  return (
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20 ring-4 ring-background">
      {initials}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full bg-muted" />
        <div className="h-6 w-40 bg-muted rounded-xl" />
        <div className="h-4 w-56 bg-muted rounded-xl" />
      </div>
      <div className="space-y-3">
        <div className="h-14 bg-muted rounded-2xl" />
        <div className="h-14 bg-muted rounded-2xl" />
        <div className="h-14 bg-muted rounded-2xl" />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { data: session, status } = useSession()

  if (status === "unauthenticated") {
    redirect("/login")
  }

  const user = session?.user
  const displayName = user?.name ?? "Unknown"

  const joinedDate = session?.expires
    ? new Date(session.expires).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : null

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Class<span className="text-blue-500">Mate</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground rounded-full">
                Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ redirectTo: "/" })}
              className="flex items-center gap-2 rounded-full border-border hover:bg-muted/60 font-medium transition-all hover:scale-[1.02]"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-blue-500/10 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-40 left-10 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 pt-28 pb-16">
        <div className="w-full max-w-md space-y-4">

          {status === "loading" ? (
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <ProfileSkeleton />
            </div>
          ) : (
            <>
              {/* Profile card */}
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">

                {/* Cover strip */}
                <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 relative">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                      backgroundSize: "32px 32px",
                    }}
                  />
                </div>

                {/* Avatar + name */}
                <div className="px-8 pb-8">
                  <div className="-mt-12 mb-5 flex items-end justify-between">
                    <div className="relative">
                      {user?.image ? (
                        <Image
                          src={user.image}
                          alt={displayName}
                          width={96}
                          height={96}
                          className="w-24 h-24 rounded-full object-cover ring-4 ring-background shadow-lg"
                        />
                      ) : (
                        <AvatarFallback name={displayName} />
                      )}
                      {/* Online dot */}
                      <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-background" />
                    </div>
                  </div>

                  {/* Name */}
                  <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
                    {displayName}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">ClassMate learner</p>
                </div>
              </div>

              {/* Info rows card */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-1">

                {/* Email */}
                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/40 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                      Email
                    </p>
                    <p className="text-sm font-medium truncate">
                      {user?.email ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border mx-3" />

                {/* Verified */}
                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/40 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                      Account status
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Verified
                    </span>
                  </div>
                </div>

                <div className="border-t border-border mx-3" />

                {/* Joined */}
                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/40 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-4 h-4 text-violet-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                      Member since
                    </p>
                    <p className="text-sm font-medium">
                      {joinedDate ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dashboard CTA */}
              <Link href="/dashboard" className="block">
                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold shadow-md shadow-blue-500/20 text-base">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Lightbulb className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-foreground">ClassMate</span>
          </div>
          <p>Advancing UN Sustainable Development Goal 4 · Quality Education for All</p>
          <p>© 2026 ClassMate</p>
        </div>
      </footer>

    </div>
  )
}