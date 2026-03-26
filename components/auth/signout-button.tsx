"use server"
import { signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function SignOutButton() {
  return (
    <form
      action={async () => {
        await signOut()
      }}
    >
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="flex items-center gap-2 rounded-full border-border hover:bg-muted/60 font-medium transition-all hover:scale-[1.02]"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </form>
  )
}