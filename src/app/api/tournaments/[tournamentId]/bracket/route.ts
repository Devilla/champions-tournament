import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBracket } from "@/lib/bracket";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tournamentId: string }> }
) {
  const { tournamentId } = await params;

  const matches = await prisma.match.findMany({
    where: { tournamentId },
    include: {
      team1: { include: { members: { include: { pokemon: true }, orderBy: { slot: "asc" } } } },
      team2: { include: { members: { include: { pokemon: true }, orderBy: { slot: "asc" } } } },
      winner: true,
    },
    orderBy: [{ round: "asc" }, { position: "asc" }],
  });

  return NextResponse.json(matches);
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ tournamentId: string }> }
) {
  const { tournamentId } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  try {
    const matches = await generateBracket(tournamentId);
    return NextResponse.json(matches, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
