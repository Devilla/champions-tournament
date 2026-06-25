"use client";

import { useScoreboard } from "@/hooks/useScoreboard";

export default function Scoreboard({ tournamentId }: { tournamentId: string }) {
  const { data: standings, isLoading } = useScoreboard(tournamentId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">No standings available yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left text-xs text-gray-400 py-3 px-3">Rank</th>
            <th className="text-left text-xs text-gray-400 py-3 px-3">Team</th>
            <th className="text-left text-xs text-gray-400 py-3 px-3">Trainer</th>
            <th className="text-center text-xs text-gray-400 py-3 px-3">W</th>
            <th className="text-center text-xs text-gray-400 py-3 px-3">L</th>
            <th className="text-center text-xs text-gray-400 py-3 px-3">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((entry) => (
            <tr
              key={entry.teamId}
              className="border-b border-gray-800 hover:bg-[#16213e]/50 transition-colors"
            >
              <td className="py-3 px-3">
                <span
                  className={`font-bold ${
                    entry.rank === 1
                      ? "text-[#EAB308]"
                      : entry.rank === 2
                      ? "text-gray-300"
                      : entry.rank === 3
                      ? "text-[#cd7f32]"
                      : "text-gray-500"
                  }`}
                >
                  {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                </span>
              </td>
              <td className="py-3 px-3 text-white font-medium text-sm">
                {entry.teamName}
              </td>
              <td className="py-3 px-3 text-gray-400 text-sm">
                {entry.trainer}
              </td>
              <td className="py-3 px-3 text-center text-green-400 font-semibold text-sm">
                {entry.wins}
              </td>
              <td className="py-3 px-3 text-center text-red-400 font-semibold text-sm">
                {entry.losses}
              </td>
              <td className="py-3 px-3 text-center text-[#EAB308] font-semibold text-sm">
                {entry.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-gray-600 mt-2 text-right">
        Auto-refreshes every 5s
      </p>
    </div>
  );
}
