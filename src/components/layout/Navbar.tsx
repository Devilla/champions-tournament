"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#1a1a2e] border-b border-[#e94560]/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e94560] rounded-full border-2 border-white relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-[2px] bg-white" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full border-2 border-[#1a1a2e]" />
              </div>
            </div>
            <span className="font-pokemon text-xs text-white hidden sm:block">
              PKM Champions
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/tournaments" className="text-gray-300 hover:text-[#e94560] transition-colors text-sm">
              Tournaments
            </Link>
            <Link href="/leaderboard" className="text-gray-300 hover:text-[#e94560] transition-colors text-sm">
              Leaderboard
            </Link>
            {session ? (
              <>
                <Link href="/teams" className="text-gray-300 hover:text-[#e94560] transition-colors text-sm">
                  My Teams
                </Link>
                <Link href="/dashboard" className="text-gray-300 hover:text-[#e94560] transition-colors text-sm">
                  Dashboard
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-[#EAB308] text-sm font-medium">
                    {session.user.username}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="bg-[#e94560] hover:bg-[#c73652] text-white text-sm px-3 py-1.5 rounded transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#e94560] hover:bg-[#c73652] text-white text-sm px-4 py-1.5 rounded transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/tournaments" className="block text-gray-300 hover:text-[#e94560] py-2 text-sm" onClick={() => setMenuOpen(false)}>
              Tournaments
            </Link>
            <Link href="/leaderboard" className="block text-gray-300 hover:text-[#e94560] py-2 text-sm" onClick={() => setMenuOpen(false)}>
              Leaderboard
            </Link>
            {session ? (
              <>
                <Link href="/teams" className="block text-gray-300 hover:text-[#e94560] py-2 text-sm" onClick={() => setMenuOpen(false)}>
                  My Teams
                </Link>
                <Link href="/dashboard" className="block text-gray-300 hover:text-[#e94560] py-2 text-sm" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={() => signOut()} className="block text-[#e94560] py-2 text-sm">
                  Logout ({session.user.username})
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-gray-300 hover:text-white py-2 text-sm" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="block text-[#e94560] py-2 text-sm" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
