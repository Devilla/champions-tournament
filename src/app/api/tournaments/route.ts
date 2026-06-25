import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateGuest } from "@/lib/guest";
import { z } from "zod";

const createTournamentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  maxTeams: z.number().refine((n) => [4, 8, 16, 32].includes(n)),
  startDate: z.string().transform((s) => new Date(s)),
});

export async function GET() {
  const tournaments = await prisma.tournament.findMany({
    include: {
      createdBy: { select: { username: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tournaments);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? (await getOrCreateGuest()).id;

    const body = await request.json();
    const { name, description, maxTeams, startDate } =
      createTournamentSchema.parse(body);

    const tournament = await prisma.tournament.create({
      data: {
        name,
        description,
        maxTeams,
        startDate,
        createdById: userId,
      },
    });

    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
