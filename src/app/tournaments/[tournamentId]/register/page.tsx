"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { use } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Team {
  id: string;
  name: string;
  user?: { username: string };
  members: { pokemon: { spriteUrl: string; name: string } }[];
}

export default function RegisterTeamPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = use(params);
  const router = useRouter();
  const [selectedTeam, setSelectedTeam] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: teams } = useSWR<Team[]>("/api/teams", fetcher);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTeam) return;

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(
        `/api/tournaments/${tournamentId}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId: selectedTeam }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        setSubmitting(false);
        return;
      }

      router.push(`/tournaments/${tournamentId}`);
    } catch {
      setError("Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-pokemon text-lg text-[#EAB308] mb-8">
        Register Team
      </h1>

      <div className="bg-[#16213e] rounded-xl p-8 border border-gray-800">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        {!teams || teams.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              You need a team to register. Create one first!
            </p>
            <a
              href="/teams/new"
              className="text-[#e94560] hover:underline"
            >
              Create a Team
            </a>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-3">
                Select a team to register:
              </label>
              <div className="space-y-3">
                {teams.map((team) => (
                  <label
                    key={team.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedTeam === team.id
                        ? "border-[#EAB308] bg-[#EAB308]/5"
                        : "border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="team"
                      value={team.id}
                      checked={selectedTeam === team.id}
                      onChange={() => setSelectedTeam(team.id)}
                      className="accent-[#EAB308]"
                    />
                    <div>
                      <span className="text-white font-medium">
                        {team.name}
                      </span>
                      {team.user && (
                        <span className="text-gray-500 text-xs ml-2">
                          by {team.user.username}
                        </span>
                      )}
                      <div className="flex gap-1 mt-1">
                        {team.members.map((m, i) => (
                          <img
                            key={i}
                            src={m.pokemon.spriteUrl}
                            alt={m.pokemon.name}
                            className="w-6 h-6 pixelated"
                          />
                        ))}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedTeam || submitting}
              className="w-full bg-[#EAB308] hover:bg-[#ca9a06] disabled:opacity-30 text-[#0f0f1a] font-bold py-3 rounded-xl transition-colors"
            >
              {submitting ? "Registering..." : "Register for Tournament"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
