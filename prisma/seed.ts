import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function fetchPokemon(id: number) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch pokemon ${id}`);
  const data = await res.json();

  return {
    id: data.id,
    name: data.name,
    type1: data.types[0].type.name,
    type2: data.types[1]?.type.name ?? null,
    hp: data.stats[0].base_stat,
    attack: data.stats[1].base_stat,
    defense: data.stats[2].base_stat,
    specialAttack: data.stats[3].base_stat,
    specialDefense: data.stats[4].base_stat,
    speed: data.stats[5].base_stat,
    spriteUrl: data.sprites.front_default,
    artworkUrl:
      data.sprites.other["official-artwork"].front_default ??
      data.sprites.front_default,
  };
}

async function main() {
  console.log("Seeding 151 Pokemon...");

  const batchSize = 10;
  for (let i = 0; i < 151; i += batchSize) {
    const batch = Array.from(
      { length: Math.min(batchSize, 151 - i) },
      (_, j) => i + j + 1
    );

    const pokemonData = await Promise.all(batch.map(fetchPokemon));

    for (const p of pokemonData) {
      await prisma.pokemon.upsert({
        where: { id: p.id },
        update: p,
        create: p,
      });
    }

    console.log(`  Seeded #${batch[0]}–#${batch[batch.length - 1]}`);
  }

  console.log("Done! 151 Pokemon seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
