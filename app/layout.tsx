import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Language Learning Study",
  description:
    "Effects of Adaptive Difficulty and AI-Generated Feedback on Speaking Motivation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
