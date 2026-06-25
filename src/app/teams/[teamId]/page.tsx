import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import TypeBadge from "@/components/pokemon/TypeBadge";
import DeleteTeamButton from "./DeleteTeamButton";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: { include: { pokemon: true }, orderBy: { slot: "asc" } },
      user: { select: { username: true, id: true } },
    },
  });

  if (!team) notFound();

  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.id === team.user.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-pokemon text-lg text-[#EAB308]">{team.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Trainer: {team.user.username}
          </p>
        </div>
        {isOwner && (
          <div className="flex gap-3">
            <Link
              href={`/teams/${team.id}/edit`}
              className="bg-[#16213e] hover:bg-[#1a2a4e] text-white text-sm px-4 py-2 rounded-lg border border-gray-700 transition-colors"
            >
              Edit
            </Link>
            <DeleteTeamButton teamId={team.id} />
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.members.map((member) => {
          const moves = [member.move1, member.move2, member.move3, member.move4].filter(Boolean) as string[];
          return (
            <div
              key={member.id}
              className="bg-[#16213e] rounded-xl p-5 border border-gray-800 flex flex-col"
            >
              {/* Header */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-500 font-mono self-start">
                  #{String(member.pokemon.id).padStart(4, "0")}
                </span>
                <Image
                  src={member.pokemon.artworkUrl}
                  alt={member.pokemon.name}
                  width={100}
                  height={100}
                  className="drop-shadow-lg"
                />
                <h3 className="text-white font-semibold capitalize text-base mt-1">
                  {member.pokemon.name}
                </h3>
                <div className="flex gap-1 mt-1">
                  <TypeBadge type={member.pokemon.type1} />
                  {member.pokemon.type2 && <TypeBadge type={member.pokemon.type2} />}
                </div>
              </div>

              {/* Base stats */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-4 text-xs text-gray-400">
                <span>HP <strong className="text-white">{member.pokemon.hp}</strong></span>
                <span>ATK <strong className="text-white">{member.pokemon.attack}</strong></span>
                <span>DEF <strong className="text-white">{member.pokemon.defense}</strong></span>
                <span>SPA <strong className="text-white">{member.pokemon.specialAttack}</strong></span>
                <span>SPD <strong className="text-white">{member.pokemon.specialDefense}</strong></span>
                <span>SPE <strong className="text-white">{member.pokemon.speed}</strong></span>
              </div>

              {/* Held item */}
              {member.heldItem && (
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <p className="text-[10px] text-purple-400 font-medium uppercase tracking-wide mb-1">
                    Held Item
                  </p>
                  <span className="inline-block bg-purple-900/40 text-purple-200 border border-purple-800/50 text-xs px-2.5 py-1 rounded-full capitalize">
                    {member.heldItem}
                  </span>
                </div>
              )}

              {/* Moves */}
              {moves.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <p className="text-[10px] text-blue-400 font-medium uppercase tracking-wide mb-2">
                    Moves
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {moves.map((move, i) => (
                      <span
                        key={i}
                        className="bg-blue-900/30 text-blue-200 border border-blue-800/40 text-[11px] px-2 py-1 rounded-lg text-center capitalize truncate"
                      >
                        {move}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
