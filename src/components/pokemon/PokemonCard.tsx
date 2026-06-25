"use client";

import Image from "next/image";
import TypeBadge from "./TypeBadge";
import { PokemonData } from "@/hooks/usePokemon";

interface PokemonCardProps {
  pokemon: PokemonData;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export default function PokemonCard({
  pokemon,
  selected,
  onClick,
  compact,
}: PokemonCardProps) {
  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`relative bg-[#16213e] rounded-lg p-2 flex flex-col items-center cursor-pointer transition-all hover:scale-105 ${
          selected ? "ring-2 ring-[#EAB308] bg-[#1a2a4e]" : ""
        }`}
      >
        <Image
          src={pokemon.spriteUrl}
          alt={pokemon.name}
          width={48}
          height={48}
          className="pixelated"
        />
        <span className="text-[10px] text-gray-300 capitalize truncate w-full text-center">
          {pokemon.name}
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative bg-[#16213e] rounded-xl p-3 flex flex-col items-center cursor-pointer transition-all hover:scale-105 hover:bg-[#1a2a4e] group ${
        selected
          ? "ring-2 ring-[#EAB308] bg-[#1a2a4e] shadow-lg shadow-[#EAB308]/20"
          : ""
      }`}
    >
      <span className="absolute top-1 left-2 text-[10px] text-gray-500 font-mono">
        #{String(pokemon.id).padStart(3, "0")}
      </span>
      {selected && (
        <span className="absolute top-1 right-2 text-[10px] text-[#EAB308] font-bold">
          ★
        </span>
      )}
      <Image
        src={pokemon.artworkUrl}
        alt={pokemon.name}
        width={80}
        height={80}
        className="drop-shadow-lg group-hover:drop-shadow-2xl transition-all"
      />
      <h3 className="text-sm font-semibold text-white capitalize mt-1">
        {pokemon.name}
      </h3>
      <div className="flex gap-1 mt-1">
        <TypeBadge type={pokemon.type1} />
        {pokemon.type2 && <TypeBadge type={pokemon.type2} />}
      </div>
      <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 mt-2 text-[9px] text-gray-400 w-full">
        <span>HP {pokemon.hp}</span>
        <span>ATK {pokemon.attack}</span>
        <span>DEF {pokemon.defense}</span>
        <span>SPA {pokemon.specialAttack}</span>
        <span>SPD {pokemon.specialDefense}</span>
        <span>SPE {pokemon.speed}</span>
      </div>
    </div>
  );
}
