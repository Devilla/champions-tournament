import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tournamentId: string }> }
) {
  const { tournamentId } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      registrations: {
        include: { team: { include: { user: { select: { username: true } } } } },
      },
      matches: { where: { status: "completed" } },
    },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  const standings = tournament.registrations.map((reg: typeof tournament.registrations[number]) => {
    const teamId = reg.teamId;
    const wins = tournament.matches.filter((m: typeof tournament.matches[number]) => m.winnerId === teamId).length;
    const losses = tournament.matches.filter(
      (m: typeof tournament.matches[number]) =>
        (m.team1Id === teamId || m.team2Id === teamId) &&
        m.winnerId !== null &&
        m.winnerId !== teamId
    ).length;
    const furthestRound = Math.max(
      0,
      ...tournament.matches
        .filter((m: typeof tournament.matches[number]) => m.team1Id === teamId || m.team2Id === teamId)
        .map((m: typeof tournament.matches[number]) => m.round)
    );

    return {
      teamId,
      teamName: reg.team.name,
      trainer: reg.team.user.username,
      wins,
      losses,
      points: wins * 3,
      furthestRound,
      seed: reg.seed,
    };
  });

  standings.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.furthestRound !== a.furthestRound)
      return b.furthestRound - a.furthestRound;
    return b.points - a.points;
  });

  return NextResponse.json(
    standings.map((s, i) => ({ ...s, rank: i + 1 }))
  );
}
