import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/providers/Providers";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Pokemon Champions Tournament",
  description: "Build your team. Enter the arena. Become the champion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0f0f1a] text-white">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-800 py-6 text-center text-gray-600 text-xs">
            <p>Pokemon Champions Tournament Platform</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
