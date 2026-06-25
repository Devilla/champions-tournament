import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    include: {
      members: { include: { pokemon: true }, orderBy: { slot: "asc" } },
      user: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-pokemon text-lg text-[#EAB308]">Teams</h1>
        <Link
          href="/teams/new"
          className="bg-[#e94560] hover:bg-[#c73652] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + New Team
        </Link>
      </div>

      {teams.length === 0 ? (
        <div className="bg-[#16213e] rounded-xl p-12 text-center border border-gray-800">
          <p className="text-gray-400 mb-4">No teams yet. Be the first!</p>
          <Link href="/teams/new" className="text-[#e94560] hover:underline">
            Create your first team
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="bg-[#16213e] rounded-xl p-6 border border-gray-800 hover:border-[#e94560]/30 transition-all hover:scale-[1.02]"
            >
              <h2 className="text-white font-semibold text-lg mb-3">{team.name}</h2>
              <div className="flex gap-2 mb-3">
                {team.members.map((m) => (
                  <img
                    key={m.id}
                    src={m.pokemon.spriteUrl}
                    alt={m.pokemon.name}
                    className="w-10 h-10 pixelated"
                    title={m.pokemon.name}
                  />
                ))}
              </div>
              <p className="text-gray-500 text-xs">
                by {team.user.username} &middot; {new Date(team.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
