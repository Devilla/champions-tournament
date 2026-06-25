"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-[#16213e] rounded-2xl p-8 shadow-xl border border-[#e94560]/20">
        <h1 className="font-pokemon text-lg text-center text-[#EAB308] mb-6">
          Trainer Login
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#e94560] focus:outline-none focus:ring-1 focus:ring-[#e94560] transition-colors"
              placeholder="ash@pokemon.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#e94560] focus:outline-none focus:ring-1 focus:ring-[#e94560] transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e94560] hover:bg-[#c73652] disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Entering Arena..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          New trainer?{" "}
          <Link href="/register" className="text-[#e94560] hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
