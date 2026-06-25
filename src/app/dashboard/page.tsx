import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [teams, createdTournaments, registrations] = await Promise.all([
    prisma.team.findMany({
      where: { userId: session.user.id },
      include: { members: { include: { pokemon: true }, orderBy: { slot: "asc" } } },
    }),
    prisma.tournament.findMany({
      where: { createdById: session.user.id },
      include: { _count: { select: { registrations: true } } },
    }),
    prisma.tournamentRegistration.findMany({
      where: { team: { userId: session.user.id } },
      include: { tournament: true, team: true },
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-pokemon text-xl text-[#EAB308] mb-8">
        Welcome, {session.user.username}!
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/teams/new"
          className="bg-[#16213e] hover:bg-[#1a2a4e] rounded-xl p-6 border border-gray-800 hover:border-[#e94560]/30 transition-all group"
        >
          <span className="text-2xl">⚔️</span>
          <h2 className="text-white font-semibold mt-2 group-hover:text-[#e94560] transition-colors">
            Create New Team
          </h2>
          <p className="text-gray-400 text-sm mt-1">Build a roster of 6 Pokemon</p>
        </Link>
        <Link
          href="/tournaments/new"
          className="bg-[#16213e] hover:bg-[#1a2a4e] rounded-xl p-6 border border-gray-800 hover:border-[#EAB308]/30 transition-all group"
        >
          <span className="text-2xl">🏆</span>
          <h2 className="text-white font-semibold mt-2 group-hover:text-[#EAB308] transition-colors">
            Create Tournament
          </h2>
          <p className="text-gray-400 text-sm mt-1">Host a new elimination tournament</p>
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          My Teams <span className="text-sm text-gray-500">({teams.length})</span>
        </h2>
        {teams.length === 0 ? (
          <div className="bg-[#16213e] rounded-xl p-8 text-center border border-gray-800">
            <p className="text-gray-400">No teams yet. Create your first team!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="bg-[#16213e] rounded-xl p-4 border border-gray-800 hover:border-[#e94560]/30 transition-all"
              >
                <h3 className="text-white font-medium mb-2">{team.name}</h3>
                <div className="flex gap-1">
                  {team.members.map((m) => (
                    <img
                      key={m.id}
                      src={m.pokemon.spriteUrl}
                      alt={m.pokemon.name}
                      className="w-8 h-8 pixelated"
                    />
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          My Tournaments <span className="text-sm text-gray-500">({createdTournaments.length})</span>
        </h2>
        {createdTournaments.length === 0 ? (
          <div className="bg-[#16213e] rounded-xl p-8 text-center border border-gray-800">
            <p className="text-gray-400">You haven&apos;t created any tournaments yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {createdTournaments.map((t) => (
              <Link
                key={t.id}
                href={`/tournaments/${t.id}`}
                className="bg-[#16213e] rounded-xl p-4 border border-gray-800 hover:border-[#EAB308]/30 transition-all"
              >
                <h3 className="text-white font-medium">{t.name}</h3>
                <div className="flex gap-3 mt-2 text-sm">
                  <span className="text-gray-400">
                    {t._count.registrations}/{t.maxTeams} teams
                  </span>
                  <span className={`capitalize ${
                    t.status === "registration" ? "text-green-400" :
                    t.status === "in_progress" ? "text-[#EAB308]" :
                    "text-gray-500"
                  }`}>
                    {t.status.replace("_", " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {registrations.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Registered In</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {registrations.map((reg) => (
              <Link
                key={reg.id}
                href={`/tournaments/${reg.tournament.id}`}
                className="bg-[#16213e] rounded-xl p-4 border border-gray-800 hover:border-[#3B82F6]/30 transition-all"
              >
                <h3 className="text-white font-medium">{reg.tournament.name}</h3>
                <p className="text-gray-400 text-sm mt-1">
                  With team: {reg.team.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
