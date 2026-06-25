import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { advanceWinner } from "@/lib/bracket";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tournamentId: string; matchId: string }> }
) {
  const { tournamentId, matchId } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.tournamentId !== tournamentId) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (match.status === "completed") {
    return NextResponse.json(
      { error: "Match already completed" },
      { status: 400 }
    );
  }

  const { winnerId, score1, score2 } = await request.json();

  if (winnerId !== match.team1Id && winnerId !== match.team2Id) {
    return NextResponse.json(
      { error: "Winner must be one of the competing teams" },
      { status: 400 }
    );
  }

  if (score1 !== undefined) {
    await prisma.match.update({
      where: { id: matchId },
      data: { score1, score2 },
    });
  }

  await advanceWinner(matchId, winnerId);

  const updated = await prisma.match.findUnique({
    where: { id: matchId },
    include: { team1: true, team2: true, winner: true },
  });

  return NextResponse.json(updated);
}
