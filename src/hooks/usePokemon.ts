import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface PokemonData {
  id: number;
  name: string;
  type1: string;
  type2: string | null;
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  spriteUrl: string;
  artworkUrl: string;
}

export function usePokemon() {
  return useSWR<PokemonData[]>("/api/pokemon", fetcher, {
    revalidateOnFocus: false,
  });
}
