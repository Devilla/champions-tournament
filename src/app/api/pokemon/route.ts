import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {};

  if (search) {
    where.name = { contains: search.toLowerCase() };
  }

  if (type) {
    where.OR = [{ type1: type.toLowerCase() }, { type2: type.toLowerCase() }];
  }

  const pokemon = await prisma.pokemon.findMany({
    where,
    orderBy: { id: "asc" },
  });

  return NextResponse.json(pokemon);
}
