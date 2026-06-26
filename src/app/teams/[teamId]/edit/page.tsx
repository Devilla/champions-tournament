import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TeamBuilder from "@/components/teams/TeamBuilder";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { teamId } = await params;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: { orderBy: { slot: "asc" } } },
  });

  if (!team) notFound();
  if (team.userId !== session.user.id) redirect("/teams");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-pokemon text-lg text-[#EAB308] mb-8">Edit Team</h1>
      <TeamBuilder
        teamId={team.id}
        initialName={team.name}
        initialMembers={team.members.map((m) => ({
          pokemonId: m.pokemonId,
          slot: m.slot,
          heldItem: m.heldItem,
          move1: m.move1,
          move2: m.move2,
          move3: m.move3,
          move4: m.move4,
        }))}
      />
    </div>
  );
}
