import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tournamentId: string }> }
) {
  const { tournamentId } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      createdBy: { select: { username: true } },
      registrations: {
        include: {
          team: {
            include: {
              members: { include: { pokemon: true }, orderBy: { slot: "asc" } },
              user: { select: { username: true } },
            },
          },
        },
        orderBy: { seed: "asc" },
      },
      matches: {
        include: { team1: true, team2: true, winner: true },
        orderBy: [{ round: "asc" }, { position: "asc" }],
      },
    },
  });

  if (!tournament) {
    return NextResponse.json(
      { error: "Tournament not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(tournament);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tournamentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tournamentId } = await params;
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });

  if (!tournament) {
    return NextResponse.json(
      { error: "Tournament not found" },
      { status: 404 }
    );
  }
  if (tournament.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.tournament.delete({ where: { id: tournamentId } });
  return NextResponse.json({ success: true });
}
