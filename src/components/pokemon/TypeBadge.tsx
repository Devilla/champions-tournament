"use client";

const typeColors: Record<string, string> = {
  normal: "bg-[#A8A878]",
  fire: "bg-[#F08030]",
  water: "bg-[#6890F0]",
  electric: "bg-[#F8D030] text-gray-900",
  grass: "bg-[#78C850]",
  ice: "bg-[#98D8D8] text-gray-900",
  fighting: "bg-[#C03028]",
  poison: "bg-[#A040A0]",
  ground: "bg-[#E0C068] text-gray-900",
  flying: "bg-[#A890F0]",
  psychic: "bg-[#F85888]",
  bug: "bg-[#A8B820]",
  rock: "bg-[#B8A038]",
  ghost: "bg-[#705898]",
  dragon: "bg-[#7038F8]",
  dark: "bg-[#705848]",
  steel: "bg-[#B8B8D0] text-gray-900",
  fairy: "bg-[#EE99AC]",
};

export default function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${
        typeColors[type] || "bg-gray-500"
      }`}
    >
      {type}
    </span>
  );
}
