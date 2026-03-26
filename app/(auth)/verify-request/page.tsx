import Link from "next/link"
import { Lightbulb, Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function VerifyPage() {
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
        </div>
      </header>

      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-blue-500/10 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-40 left-10 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm text-center space-y-5">

            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <Mail className="w-8 h-8 text-blue-500" />
            </div>

            {/* Badge + heading */}
            <div>
              <Badge
                variant="outline"
                className="mb-3 px-3 py-1 text-xs font-semibold tracking-widest uppercase text-blue-500 border-blue-500/30 bg-blue-500/10 rounded-full"
              >
                Check your inbox
              </Badge>
              <h1 className="text-2xl font-extrabold tracking-tight mt-2">
                Magic link sent!
              </h1>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed max-w-xs mx-auto">
                We&apos;ve emailed you a secure sign-in link. Click it to access your ClassMate account — it expires in 10 minutes.
              </p>
            </div>

            {/* Tip */}
            <p className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-xl px-4 py-3 leading-relaxed">
              💡 Can&apos;t find it? Check your spam or junk folder.
            </p>

            {/* Back to home */}
            <Link href="/">
              <Button
                variant="outline"
                className="w-full h-11 rounded-full border-border font-medium flex items-center justify-center gap-2 hover:bg-muted/60"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </Button>
            </Link>

          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Wrong email?{" "}
            <Link href="/login" className="underline underline-offset-2 hover:text-blue-500 transition-colors">
              Try again
            </Link>
          </p>
        </div>
      </main>

    </div>
  )
}