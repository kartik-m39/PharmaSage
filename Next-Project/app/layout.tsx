import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Newsreader, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Pharmasage | The Clinical Curator",
  description: "AI-powered pharmaceutical solutions",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  return (
    <ClerkProvider>
      <html lang="en" className={`${newsreader.variable} ${plexMono.variable} ${inter.variable}`}>
        <body
          className={`font-sans bg-[#E6D5C3] text-[#1A1A1A] antialiased min-h-screen flex flex-col`}
        >
          {/* Minimal fixed top bar, serif logo, uppercase mono links */}
          <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-5 bg-[#E6D5C3] border-b border-[#1A1A1A]">
            <div className="flex items-center text-2xl font-serif">
              <Link href="/">
                <span className="tracking-tight font-medium">Pharmasage.</span>
              </Link>
            </div>


            {/* <div className="flex justify-end font-mono text-[11px] uppercase tracking-widest">
              {/* <SignedOut>
                <div className="flex gap-4">
                  <SignInButton />
                  <SignUpButton />
                </div>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn> */}
              {/* <Show when="signed-out"> <div className="flex gap-4"> <SignInButton /> <SignUpButton /> </div> </Show> <Show when="signed-in"> <UserButton /> </Show>
            </div> */}

            <div className="flex justify-end font-mono text-[11px] uppercase tracking-widest">
              {!userId ? (
                <div className="flex gap-4">
                  <SignInButton />
                  <SignUpButton />
                </div>
              ) : (
                <UserButton />
              )}
            </div>
          </header>

          <main className="flex-1 pt-[73px]">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}