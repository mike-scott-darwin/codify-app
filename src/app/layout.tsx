import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { TierProvider } from "@/lib/tier-context";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Codify — Stop Prompting. Start Codifying.",
  description:
    "Your business has knowledge that makes it unique. AI can't use any of it. We fix that. Structure your expertise into reference files AI reads before generating anything.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrains.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        <AuthProvider><TierProvider>{children}</TierProvider></AuthProvider>
      </body>
    </html>
  );
}
