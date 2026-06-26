import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateGuest } from "@/lib/guest";
import { z } from "zod";

const memberSchema = z.object({
  pokemonId: z.number().int().min(1),
  slot: z.number().int().min(1).max(6),
  heldItem: z.string().max(100).optional().nullable(),
  move1: z.string().max(100).optional().nullable(),
  move2: z.string().max(100).optional().nullable(),
  move3: z.string().max(100).optional().nullable(),
  move4: z.string().max(100).optional().nullable(),
});

const createTeamSchema = z.object({
  name: z.string().min(1).max(50),
  members: z.array(memberSchema).length(6),
});

export async function GET() {
  const session = await auth();

  const teams = await prisma.team.findMany({
    where: session ? { userId: session.user.id } : undefined,
    include: {
      members: { include: { pokemon: true }, orderBy: { slot: "asc" } },
      user: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(teams);
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? (await getOrCreateGuest()).id;

    const body = await request.json();
    const { name, members } = createTeamSchema.parse(body);

    const slots = members.map((m) => m.slot);
    if (new Set(slots).size !== 6) {
      return NextResponse.json({ error: "Duplicate slots" }, { status: 400 });
    }

    const pokemonIds = members.map((m) => m.pokemonId);
    if (new Set(pokemonIds).size !== 6) {
      return NextResponse.json(
        { error: "Duplicate Pokemon" },
        { status: 400 }
      );
    }

    const team = await prisma.team.create({
      data: {
        name,
        userId,
        members: {
          create: members.map((m) => ({
            pokemonId: m.pokemonId,
            slot: m.slot,
            heldItem: m.heldItem ?? null,
            move1: m.move1 ?? null,
            move2: m.move2 ?? null,
            move3: m.move3 ?? null,
            move4: m.move4 ?? null,
          })),
        },
      },
      include: { members: { include: { pokemon: true }, orderBy: { slot: "asc" } } },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("[POST /api/teams]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
