"use client"

import { useTransition, useState, ChangeEvent, KeyboardEvent } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lightbulb, Loader2, Mail, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isPendingMagic, startMagicTransition] = useTransition()
  const [isPendingGoogle, startGoogleTransition] = useTransition()

  const handleMagicLink = () => {
    if (!email) return
    startMagicTransition(async () => {
      await signIn("nodemailer", {
        email,
        redirectTo: "/dashboard",
      })
    })
  }

  const handleGoogle = () => {
    startGoogleTransition(async () => {
      await signIn("google", { redirectTo: "/dashboard" })
    })
  }

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
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground rounded-full">
              ← Back to home
            </Button>
          </Link>
        </div>
      </header>

      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 bg-linear-to-b from-blue-500/10 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-40 left-10 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 mb-5 shadow-lg shadow-blue-500/20">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight mt-2">
                Welcome to ClassMate
              </h1>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                Sign in to continue your learning journey.
              </p>
            </div>

            <div className="space-y-4">

              {/* Email input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Email address
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleMagicLink()}
                  className="rounded-xl border-border bg-background h-11 focus-visible:ring-blue-500/40"
                  disabled={isPendingMagic}
                />
                <Button
                  onClick={handleMagicLink}
                  disabled={isPendingMagic || !email}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold shadow-md shadow-blue-500/20 transition-all"
                >
                  {isPendingMagic ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending magic link...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Magic Link
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 text-xs text-muted-foreground font-medium">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Google */}
              <Button
                onClick={handleGoogle}
                disabled={isPendingGoogle}
                variant="outline"
                className="w-full h-11 rounded-full border-border hover:bg-muted/60 font-medium flex items-center justify-center gap-3 transition-all"
              >
                {isPendingGoogle ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 48 48" className="h-4 w-4 shrink-0">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.69 1.22 9.18 3.6l6.85-6.85C35.96 2.24 30.37 0 24 0 14.63 0 6.44 5.48 2.56 13.44l7.98 6.2C12.41 13.18 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.4c-.54 2.9-2.18 5.35-4.64 7l7.3 5.66c4.26-3.93 6.7-9.72 6.7-16.91z"/>
                      <path fill="#FBBC05" d="M10.54 28.64A14.5 14.5 0 019.5 24c0-1.62.28-3.18.78-4.64l-7.98-6.2A23.96 23.96 0 000 24c0 3.77.9 7.34 2.5 10.44l8.04-5.8z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.92-2.13 15.9-5.78l-7.3-5.66c-2.02 1.36-4.6 2.16-8.6 2.16-6.26 0-11.59-3.68-13.46-9.14l-8.04 5.8C6.44 42.52 14.63 48 24 48z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
            By signing in, you agree to ClassMate&apos;s{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-blue-500 transition-colors">
              Terms
            </Link>{" "}
            &amp;{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-blue-500 transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  )
}