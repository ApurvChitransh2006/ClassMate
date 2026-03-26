import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ModeToggle } from "@/components/theme/ModeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClassMate",
  description: "Created by Apurv Chitransh",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
                {children}
              <ModeToggle />
            </ThemeProvider>
        </body>
      </html>
    </>
  )
}
