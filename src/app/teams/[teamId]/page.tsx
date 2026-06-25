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
        {team.members.map((member) => (
          <div
            key={member.id}
            className="bg-[#16213e] rounded-xl p-6 border border-gray-800 flex flex-col items-center"
          >
            <span className="text-[10px] text-gray-500 font-mono self-start">
              #{String(member.pokemon.id).padStart(3, "0")}
            </span>
            <Image
              src={member.pokemon.artworkUrl}
              alt={member.pokemon.name}
              width={120}
              height={120}
              className="drop-shadow-lg"
            />
            <h3 className="text-white font-semibold capitalize text-lg mt-2">
              {member.pokemon.name}
            </h3>
            <div className="flex gap-1 mt-2">
              <TypeBadge type={member.pokemon.type1} />
              {member.pokemon.type2 && (
                <TypeBadge type={member.pokemon.type2} />
              )}
            </div>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-4 text-xs text-gray-400">
              <span>HP <strong className="text-white">{member.pokemon.hp}</strong></span>
              <span>ATK <strong className="text-white">{member.pokemon.attack}</strong></span>
              <span>DEF <strong className="text-white">{member.pokemon.defense}</strong></span>
              <span>SPA <strong className="text-white">{member.pokemon.specialAttack}</strong></span>
              <span>SPD <strong className="text-white">{member.pokemon.specialDefense}</strong></span>
              <span>SPE <strong className="text-white">{member.pokemon.speed}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
