"use client"

import { useTransition } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function SignIn() {
  const [isPending, startTransition] = useTransition()

  const handleSignIn = () => {
    startTransition(async () => {
      await signIn("google", { redirectTo: "/dashboard" })
    })
  }

  return (
    <form action={handleSignIn}>
      <Button
        type="submit"
        variant="outline"
        className="w-full h-11 flex items-center justify-center gap-3 rounded-full border-border hover:bg-muted/60 font-medium transition-all"
        disabled={isPending}
      >
        {isPending ? (
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
    </form>
  )
}