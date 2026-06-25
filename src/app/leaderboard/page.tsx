import { prisma } from "@/lib/prisma";

export default async function LeaderboardPage() {
  const matches = await prisma.match.findMany({
    where: { status: "completed", winnerId: { not: null } },
    include: {
      team1: { include: { user: { select: { username: true } } } },
      team2: { include: { user: { select: { username: true } } } },
    },
  });

  const teamStats: Record<
    string,
    { teamName: string; trainer: string; wins: number; losses: number; tournaments: Set<string> }
  > = {};

  for (const match of matches) {
    const processTeam = (teamId: string | null, teamName: string, trainer: string) => {
      if (!teamId) return;
      if (!teamStats[teamId]) {
        teamStats[teamId] = { teamName, trainer, wins: 0, losses: 0, tournaments: new Set() };
      }
      teamStats[teamId].tournaments.add(match.tournamentId);
      if (match.winnerId === teamId) {
        teamStats[teamId].wins++;
      } else {
        teamStats[teamId].losses++;
      }
    };

    if (match.team1) processTeam(match.team1Id, match.team1.name, match.team1.user.username);
    if (match.team2) processTeam(match.team2Id, match.team2.name, match.team2.user.username);
  }

  const leaderboard = Object.entries(teamStats)
    .map(([teamId, stats]) => ({
      teamId,
      ...stats,
      tournamentCount: stats.tournaments.size,
      points: stats.wins * 3,
    }))
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-pokemon text-lg text-[#EAB308] mb-8">
        Global Leaderboard
      </h1>

      {leaderboard.length === 0 ? (
        <div className="bg-[#16213e] rounded-xl p-12 text-center border border-gray-800">
          <p className="text-gray-400">
            No matches completed yet. The leaderboard will appear once
            tournaments start!
          </p>
        </div>
      ) : (
        <div className="bg-[#16213e] rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-xs text-gray-400 py-3 px-4">Rank</th>
                <th className="text-left text-xs text-gray-400 py-3 px-4">Team</th>
                <th className="text-left text-xs text-gray-400 py-3 px-4">Trainer</th>
                <th className="text-center text-xs text-gray-400 py-3 px-4">W</th>
                <th className="text-center text-xs text-gray-400 py-3 px-4">L</th>
                <th className="text-center text-xs text-gray-400 py-3 px-4">Pts</th>
                <th className="text-center text-xs text-gray-400 py-3 px-4">Events</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr
                  key={entry.teamId}
                  className="border-b border-gray-800 hover:bg-[#0f0f1a]/50 transition-colors"
                >
                  <td className="py-3 px-4">
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
                      {entry.rank <= 3
                        ? ["🥇", "🥈", "🥉"][entry.rank - 1]
                        : `#${entry.rank}`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-medium">
                    {entry.teamName}
                  </td>
                  <td className="py-3 px-4 text-gray-400">{entry.trainer}</td>
                  <td className="py-3 px-4 text-center text-green-400 font-semibold">
                    {entry.wins}
                  </td>
                  <td className="py-3 px-4 text-center text-red-400 font-semibold">
                    {entry.losses}
                  </td>
                  <td className="py-3 px-4 text-center text-[#EAB308] font-semibold">
                    {entry.points}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-400">
                    {entry.tournamentCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
