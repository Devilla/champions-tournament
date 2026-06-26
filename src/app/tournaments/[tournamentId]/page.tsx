"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import BracketView from "@/components/tournaments/BracketView";
import Scoreboard from "@/components/scoreboard/Scoreboard";
import useSWR from "swr";
import { use } from "react";

const fetcher = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  maxTeams: number;
  startDate: string;
  status: string;
  createdById: string;
  createdBy: { username: string };
  registrations: {
    id: string;
    teamId: string;
    team: {
      id: string;
      name: string;
      user: { username: string };
      members: { pokemon: { spriteUrl: string; name: string } }[];
    };
  }[];
  matches: unknown[];
}

export default function TournamentDetailPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = use(params);
  const [tab, setTab] = useState<"bracket" | "scoreboard" | "teams">("bracket");
  const [generatingBracket, setGeneratingBracket] = useState(false);

  const { data: tournament, mutate } = useSWR<Tournament>(
    `/api/tournaments/${tournamentId}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const { data: bracket, mutate: mutateBracket } = useSWR(
    `/api/tournaments/${tournamentId}/bracket`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const handleGenerateBracket = useCallback(async () => {
    setGeneratingBracket(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/bracket`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to generate bracket");
      } else {
        mutate();
        mutateBracket();
      }
    } finally {
      setGeneratingBracket(false);
    }
  }, [tournamentId, mutate, mutateBracket]);

  if (!tournament) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-pokemon text-lg text-[#EAB308]">
              {tournament.name}
            </h1>
            {tournament.description && (
              <p className="text-gray-400 mt-2">{tournament.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-gray-500">
                by {tournament.createdBy?.username}
              </span>
              <span
                className={`capitalize font-semibold ${
                  tournament.status === "registration"
                    ? "text-green-400"
                    : tournament.status === "in_progress"
                    ? "text-[#EAB308]"
                    : "text-gray-400"
                }`}
              >
                {tournament.status.replace("_", " ")}
              </span>
              <span className="text-gray-500">
                {tournament.registrations.length}/{tournament.maxTeams} teams
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {tournament.status === "registration" && (
              <Link
                href={`/tournaments/${tournamentId}/register`}
                className="bg-[#e94560] hover:bg-[#c73652] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Register Team
              </Link>
            )}
            {tournament.status === "registration" &&
              tournament.registrations.length >= 2 && (
                <button
                  onClick={handleGenerateBracket}
                  disabled={generatingBracket}
                  className="bg-[#EAB308] hover:bg-[#ca9a06] disabled:opacity-50 text-[#0f0f1a] text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  {generatingBracket ? "Generating..." : "Generate Bracket"}
                </button>
              )}
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-800">
        {(["bracket", "scoreboard", "teams"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-[#e94560] text-[#e94560]"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "bracket" && (
        <div className="bg-[#16213e] rounded-xl p-6 border border-gray-800">
          <BracketView
            matches={bracket || []}
            onMatchUpdate={() => {
              mutateBracket();
              mutate();
            }}
          />
        </div>
      )}

      {tab === "scoreboard" && (
        <div className="bg-[#16213e] rounded-xl p-6 border border-gray-800">
          <Scoreboard tournamentId={tournamentId} />
        </div>
      )}

      {tab === "teams" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournament.registrations.length === 0 ? (
            <div className="col-span-full bg-[#16213e] rounded-xl p-8 text-center border border-gray-800">
              <p className="text-gray-400">No teams registered yet.</p>
            </div>
          ) : (
            tournament.registrations.map((reg) => (
              <div
                key={reg.id}
                className="bg-[#16213e] rounded-xl p-4 border border-gray-800"
              >
                <h3 className="text-white font-medium">{reg.team.name}</h3>
                <p className="text-gray-500 text-sm">
                  Trainer: {reg.team.user.username}
                </p>
                <div className="flex gap-1 mt-2">
                  {reg.team.members.map((m, i) => (
                    <img
                      key={i}
                      src={m.pokemon.spriteUrl}
                      alt={m.pokemon.name}
                      className="w-8 h-8 pixelated"
                      title={m.pokemon.name}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
