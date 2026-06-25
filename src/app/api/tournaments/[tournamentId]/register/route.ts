import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tournamentId: string }> }
) {
  const { tournamentId } = await params;
  const { teamId } = await request.json();

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { _count: { select: { registrations: true } } },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  if (tournament.status !== "registration") {
    return NextResponse.json(
      { error: "Registration is closed" },
      { status: 400 }
    );
  }

  if (tournament._count.registrations >= tournament.maxTeams) {
    return NextResponse.json({ error: "Tournament is full" }, { status: 400 });
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const existing = await prisma.tournamentRegistration.findUnique({
    where: { tournamentId_teamId: { tournamentId, teamId } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Team already registered" },
      { status: 400 }
    );
  }

  const registration = await prisma.tournamentRegistration.create({
    data: { tournamentId, teamId },
  });

  return NextResponse.json(registration, { status: 201 });
}
