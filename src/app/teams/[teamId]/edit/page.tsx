import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TeamBuilder from "@/components/teams/TeamBuilder";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const session = await getServerSession(authOptions);
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
        }))}
      />
    </div>
  );
}
