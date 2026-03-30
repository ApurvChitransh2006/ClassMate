import NextAuth from "next-auth";
import prisma from "./lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Nodemailer from "next-auth/providers/nodemailer"
import { createTransport } from "nodemailer"
import { getMagicLinkEmailHtml } from "./components/auth/email-template";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google(
      {
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        allowDangerousEmailAccountLinking: true
      }
    ),
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      maxAge: 15 * 60,
      async sendVerificationRequest({ identifier: email, url, provider: { server, from } }) {
          const transport = createTransport(server)
      
          await transport.sendMail({
            to: email,
            from: `ClassMate <${from}>`,
            subject: "Your ClassMate sign-in link ✦",
            text: `Sign in to ClassMate\n\nClick the link below to sign in. It expires in 15 minutes.\n\n${url}\n\nIf you didn't request this, you can safely ignore this email.\n\n© 2026 ClassMate`,
            html: getMagicLinkEmailHtml(url, email),
          })
        },
      })
  ],
   callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        const googleImage = profile?.picture as string | undefined
        const googleName = profile?.name as string | undefined
 
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, image: true, name: true },
        })
 
        if (existingUser) {
          const updates: { image?: string; name?: string } = {}
 
          // Only update image if user doesn't have one
          if (!existingUser.image && googleImage) {
            updates.image = googleImage
          }
 
          // Only update name if user doesn't have one
          if (!existingUser.name && googleName) {
            updates.name = googleName
          }
 
          if (Object.keys(updates).length > 0) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: updates,
            })
          }
        }
      }
 
      return true
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
    error: "/error",
  }
})