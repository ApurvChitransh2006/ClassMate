import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Lightbulb, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default async function OnboardingPage() {
  const session = await auth()

  // Not logged in → go to login
  if (!session?.user?.email) {
    redirect("/login")
  }

  // Already has a name → skip onboarding
  if (session.user.name) {
    redirect("/dashboard")
  }

  async function saveName(formData: FormData) {
    "use server"

    const session = await auth()
    if (!session?.user?.email) redirect("/login")

    const name = formData.get("name")?.toString().trim()

    if (!name || name.length < 2) return

    await prisma.user.update({
      where: { email: session.user.email },
      data: { name },
    })

    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Class<span className="text-blue-500">Mate</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-blue-500/10 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-40 left-10 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">

            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

            <div className="p-8">

              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-5 shadow-lg shadow-blue-500/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>

                {/* Step dots */}
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  <div className="h-1 w-6 rounded-full bg-blue-500" />
                  <div className="h-1 w-2 rounded-full bg-muted" />
                  <div className="h-1 w-2 rounded-full bg-muted" />
                </div>

                <h1 className="text-2xl font-extrabold tracking-tight">
                  Welcome to ClassMate
                </h1>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed max-w-xs mx-auto">
                  Let&apos;s set up your account. What should we call you?
                </p>
              </div>

              {/* Form — server action */}
              <form action={saveName} className="space-y-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Full name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g. Riya Sharma"
                    autoFocus
                    autoComplete="name"
                    required
                    minLength={2}
                    className="h-11 rounded-xl bg-background border-border focus-visible:ring-blue-500/40"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold shadow-md shadow-blue-500/20 transition-all"
                >
                  Continue to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

            </div>
          </div>

          {/* SDG note */}
          <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Advancing UN SDG 4 · Quality Education for All
            </span>
          </p>
        </div>
      </main>
    </div>
  )
}