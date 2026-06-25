import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    include: {
      createdBy: { select: { username: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-pokemon text-lg text-[#EAB308]">Tournaments</h1>
        <Link
          href="/tournaments/new"
          className="bg-[#e94560] hover:bg-[#c73652] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Create Tournament
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="bg-[#16213e] rounded-xl p-12 text-center border border-gray-800">
          <p className="text-gray-400 mb-4">No tournaments yet. Be the first!</p>
          <Link href="/tournaments/new" className="text-[#e94560] hover:underline">
            Create a tournament
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/tournaments/${tournament.id}`}
              className="bg-[#16213e] rounded-xl p-6 border border-gray-800 hover:border-[#EAB308]/30 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-white font-semibold">{tournament.name}</h2>
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    tournament.status === "registration"
                      ? "bg-green-500/10 text-green-400"
                      : tournament.status === "in_progress"
                      ? "bg-[#EAB308]/10 text-[#EAB308]"
                      : "bg-gray-500/10 text-gray-400"
                  }`}
                >
                  {tournament.status.replace("_", " ")}
                </span>
              </div>
              {tournament.description && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {tournament.description}
                </p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  by {tournament.createdBy.username}
                </span>
                <span className="text-gray-400">
                  {tournament._count.registrations}/{tournament.maxTeams} teams
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Starts {new Date(tournament.startDate).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
