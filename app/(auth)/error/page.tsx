"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function Error() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
          
          <AlertTriangle className="w-10 h-10 text-destructive" />

          <h1 className="text-2xl font-semibold">Something went wrong</h1>

          <p className="text-sm text-muted-foreground">
            We couldn&apos;t process your request.
          </p>

          <Link href="/">
            <Button>Go to Home</Button>
          </Link>

        </CardContent>
      </Card>
    </div>
  );
}