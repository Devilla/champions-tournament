import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateTeamSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  members: z
    .array(
      z.object({
        pokemonId: z.number().int().min(1).max(151),
        slot: z.number().int().min(1).max(6),
      })
    )
    .length(6)
    .optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: { include: { pokemon: true }, orderBy: { slot: "asc" } },
      user: { select: { username: true } },
    },
  });

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json(team);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await params;
  const team = await prisma.team.findUnique({ where: { id: teamId } });

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }
  if (team.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, members } = updateTeamSchema.parse(body);

    if (members) {
      await prisma.teamMember.deleteMany({ where: { teamId } });
      await prisma.teamMember.createMany({
        data: members.map((m) => ({
          teamId,
          pokemonId: m.pokemonId,
          slot: m.slot,
        })),
      });
    }

    const updated = await prisma.team.update({
      where: { id: teamId },
      data: { name: name ?? team.name },
      include: { members: { include: { pokemon: true }, orderBy: { slot: "asc" } } },
    });

    return NextResponse.json(updated);
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await params;
  const team = await prisma.team.findUnique({ where: { id: teamId } });

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }
  if (team.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.team.delete({ where: { id: teamId } });
  return NextResponse.json({ success: true });
}
