"use client";

import { useState } from "react";

interface Team {
  id: string;
  name: string;
}

interface Match {
  id: string;
  tournamentId: string;
  round: number;
  position: number;
  team1Id: string | null;
  team2Id: string | null;
  winnerId: string | null;
  score1: number | null;
  score2: number | null;
  status: string;
  team1: Team | null;
  team2: Team | null;
  winner: Team | null;
}

interface BracketViewProps {
  matches: Match[];
  onMatchUpdate?: () => void;
}

export default function BracketView({
  matches,
  onMatchUpdate,
}: BracketViewProps) {
  const rounds = matches.reduce<Record<number, Match[]>>((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {});

  const roundNumbers = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);

  const totalRounds = roundNumbers.length;

  function getRoundName(round: number) {
    const remaining = totalRounds - round;
    if (remaining === 0) return "Final";
    if (remaining === 1) return "Semifinals";
    if (remaining === 2) return "Quarterfinals";
    return `Round ${round}`;
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Bracket has not been generated yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max">
        {roundNumbers.map((round) => (
          <div key={round} className="flex flex-col">
            <h3 className="text-center text-sm font-semibold text-[#EAB308] mb-4">
              {getRoundName(round)}
            </h3>
            <div
              className="flex flex-col justify-around flex-1 gap-4"
              style={{ minWidth: "220px" }}
            >
              {rounds[round]
                .sort((a, b) => a.position - b.position)
                .map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onUpdate={onMatchUpdate}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchCard({
  match,
  onUpdate,
}: {
  match: Match;
  onUpdate?: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function declareWinner(winnerId: string) {
    setSubmitting(true);
    try {
      await fetch(
        `/api/tournaments/${match.tournamentId}/matches/${match.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ winnerId }),
        }
      );
      onUpdate?.();
    } finally {
      setSubmitting(false);
    }
  }

  const canDeclare =
    match.status === "ready" &&
    !match.winnerId &&
    match.team1Id &&
    match.team2Id;

  return (
    <div className="bg-[#16213e] rounded-lg border border-gray-700 overflow-hidden">
      <TeamSlot
        team={match.team1}
        score={match.score1}
        isWinner={match.winnerId === match.team1?.id}
        canSelect={!!canDeclare && !submitting}
        onSelect={() => match.team1 && declareWinner(match.team1.id)}
      />
      <div className="h-px bg-gray-700" />
      <TeamSlot
        team={match.team2}
        score={match.score2}
        isWinner={match.winnerId === match.team2?.id}
        canSelect={!!canDeclare && !submitting}
        onSelect={() => match.team2 && declareWinner(match.team2.id)}
      />
      {match.status === "completed" && (
        <div className="bg-green-900/20 text-center text-[10px] text-green-400 py-0.5">
          Completed
        </div>
      )}
      {match.status === "pending" && !match.team1Id && !match.team2Id && (
        <div className="bg-gray-900/40 text-center text-[10px] text-gray-500 py-0.5">
          Waiting
        </div>
      )}
    </div>
  );
}

function TeamSlot({
  team,
  score,
  isWinner,
  canSelect,
  onSelect,
}: {
  team: Team | null;
  score: number | null;
  isWinner: boolean;
  canSelect: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={canSelect ? onSelect : undefined}
      className={`flex items-center justify-between px-3 py-2 transition-colors ${
        isWinner ? "bg-[#EAB308]/10" : ""
      } ${canSelect ? "cursor-pointer hover:bg-[#e94560]/10" : ""}`}
    >
      <div className="flex items-center gap-2">
        {isWinner && <span className="text-[#EAB308] text-xs">★</span>}
        <span
          className={`text-sm ${
            team
              ? isWinner
                ? "text-[#EAB308] font-semibold"
                : "text-white"
              : "text-gray-600 italic"
          }`}
        >
          {team?.name || "TBD"}
        </span>
      </div>
      {score !== null && (
        <span className={`text-sm font-mono ${isWinner ? "text-[#EAB308]" : "text-gray-400"}`}>
          {score}
        </span>
      )}
      {canSelect && (
        <span className="text-[10px] text-[#e94560]">Select</span>
      )}
    </div>
  );
}
