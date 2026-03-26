import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const session = await auth()

      if (!session) {
        redirect("/login");
      }

      // ⚠️ Logged in but no name → onboarding
      if (!session.user?.name) {
        redirect("/onboarding");
      }

  return (
    <div>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
    </div>
  )
}
