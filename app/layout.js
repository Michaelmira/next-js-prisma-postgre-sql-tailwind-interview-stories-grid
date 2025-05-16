// Triggering a new commit for Vercel deployment
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Navbar from "./components/Navbar";
import { SelectedStoryProvider } from "./context/SelectedStoryContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Create Next App",
  description: "A Next.js app for managing interview stories with authentication.",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50`}
      >
        <SessionProvider session={session}>
          <SelectedStoryProvider>
            <Navbar />
            {/* Main Content */}
            <main className="flex-1 p-4 overflow-y-auto">
              {children}
            </main>
          </SelectedStoryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
