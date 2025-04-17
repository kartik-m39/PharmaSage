import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Poppins } from "next/font/google";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Choose weights you need
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={poppins.variable}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header className="flex justify-between items-center px-6 py-3 h-16 bg-gray-900">
            <div className="flex items-center text-xl font-semibold space-x-1">
              <div className="w-2 h-4 rounded-full bg-gradient-to-r from-green-400 to to-blue-500"></div>
              <Link href="/">
                <span>Pharmasage</span>
              </Link>
            </div>

            <nav className="bg-gray-800 text-white py-2 px-6 rounded-full flex items-center gap-10 font-medium shadow-inner">
              <a href="#" className="hover:text-gray-600 transition">
                Overview
              </a>

              <div className="relative group">
                <button className="hover:text-gray-300 transition">
                  Products
                </button>

                <div className="absolute opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none flex-col bg-gray-800 text-white rounded shadow-lg mt-0 w-40 z-10 transition-opacity duration-200">
                  <a
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-700 transition"
                  >
                    Product 1
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-700 transition"
                  >
                    Product 2
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-700 transition"
                  >
                    Product 3
                  </a>
                </div>
              </div>

              <a href="#" className="hover:text-gray-600 transition">
                Resouces
              </a>
              <a href="#" className="hover:text-gray-600 transition">
                FAQs
              </a>
            </nav>

            <div className="w-32 flex justify-end">
              <SignedOut>
                <SignInButton className="bg-gray-800 hover:bg-gray-700 text-white py-1 px-4 rounded ease-in-out transition" />
                <SignUpButton className="bg-gray-800 hover:bg-gray-700 text-white py-1 px-4 rounded ease-in-out transition ml-2" />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>

          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
