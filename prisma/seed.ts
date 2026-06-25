import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

// Official Pokémon Champions roster (208 species) sourced from:
// https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_in_Pok%C3%A9mon_Champions
const POKEMON_CHAMPIONS_IDS = [
  // Gen 1
  3, 6, 9, 15, 18, 24, 25, 26, 36, 38, 45, 59, 65, 68, 71, 80, 94,
  115, 121, 127, 128, 130, 132, 134, 135, 136, 142, 143, 149,
  // Gen 2
  154, 157, 160, 168, 181, 184, 186, 196, 197, 199, 205, 208,
  211, 212, 214, 227, 229, 248,
  // Gen 3
  254, 257, 260, 279, 282, 302, 303, 306, 308, 310, 319, 323,
  324, 334, 350, 351, 354, 358, 359, 362, 376,
  // Gen 4
  389, 392, 395, 398, 405, 407, 409, 411, 428, 442, 445, 448,
  450, 454, 460, 461, 464, 470, 471, 472, 473, 475, 478, 479,
  // Gen 5
  497, 500, 503, 505, 510, 512, 514, 516, 518, 530, 531, 534,
  545, 547, 553, 560, 563, 569, 571, 579, 584, 587, 604, 609,
  614, 618, 623, 635, 637,
  // Gen 6
  652, 655, 658, 660, 663, 666, 668, 670, 671, 675, 676, 678,
  681, 683, 685, 687, 689, 691, 693, 695, 697, 699, 700, 701,
  702, 706, 707, 709, 711, 713, 715,
  // Gen 7
  724, 727, 730, 733, 740, 745, 748, 750, 752, 758, 763, 765,
  766, 778, 780, 784,
  // Gen 8
  823, 841, 842, 844, 855, 858, 861, 866, 867, 869, 870, 877,
  887, 899, 900, 902, 903, 904,
  // Gen 9
  908, 911, 914, 925, 934, 936, 937, 939, 952, 956, 959, 964,
  968, 970, 972, 979, 981, 983, 1000, 1013, 1018, 1019,
];

async function fetchPokemon(id: number) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch pokemon ${id}`);
  const data = await res.json();

  const artwork = data.sprites.other?.["official-artwork"]?.front_default;
  const sprite = data.sprites.front_default;

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
    spriteUrl: sprite ?? artwork ?? "",
    artworkUrl: artwork ?? sprite ?? "",
  };
}

async function main() {
  console.log(`Seeding ${POKEMON_CHAMPIONS_IDS.length} Pokémon Champions roster...`);

  const batchSize = 10;
  for (let i = 0; i < POKEMON_CHAMPIONS_IDS.length; i += batchSize) {
    const batch = POKEMON_CHAMPIONS_IDS.slice(i, i + batchSize);
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

  // Remove any previously seeded Pokémon not in the Champions roster that aren't in use
  const removed = await prisma.pokemon.deleteMany({
    where: {
      id: { notIn: POKEMON_CHAMPIONS_IDS },
      teamMembers: { none: {} },
    },
  });
  if (removed.count > 0) {
    console.log(`\nRemoved ${removed.count} non-roster Pokémon from the database.`);
  }

  console.log(`\nDone! ${POKEMON_CHAMPIONS_IDS.length} Pokémon Champions roster seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
