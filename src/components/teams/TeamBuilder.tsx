"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PokemonCard from "../pokemon/PokemonCard";
import TypeBadge from "../pokemon/TypeBadge";
import { usePokemon, PokemonData } from "@/hooks/usePokemon";

const POKEMON_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic",
  "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

interface TeamBuilderProps {
  initialName?: string;
  initialMembers?: { pokemonId: number; slot: number }[];
  teamId?: string;
}

export default function TeamBuilder({
  initialName = "",
  initialMembers = [],
  teamId,
}: TeamBuilderProps) {
  const router = useRouter();
  const { data: allPokemon, isLoading } = usePokemon();

  const [teamName, setTeamName] = useState(initialName);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonData[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (allPokemon && initialMembers.length > 0 && !initialized) {
    const initial = initialMembers
      .sort((a, b) => a.slot - b.slot)
      .map((m) => allPokemon.find((p) => p.id === m.pokemonId))
      .filter(Boolean) as PokemonData[];
    setSelectedPokemon(initial);
    setInitialized(true);
  }

  const filtered = useMemo(() => {
    if (!allPokemon) return [];
    return allPokemon.filter((p) => {
      const matchesSearch = !search || p.name.includes(search.toLowerCase());
      const matchesType =
        !typeFilter ||
        p.type1 === typeFilter ||
        p.type2 === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [allPokemon, search, typeFilter]);

  function togglePokemon(pokemon: PokemonData) {
    const isSelected = selectedPokemon.some((p) => p.id === pokemon.id);
    if (isSelected) {
      setSelectedPokemon(selectedPokemon.filter((p) => p.id !== pokemon.id));
    } else if (selectedPokemon.length < 6) {
      setSelectedPokemon([...selectedPokemon, pokemon]);
    }
  }

  async function handleSave() {
    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }
    if (selectedPokemon.length !== 6) {
      setError("Select exactly 6 Pokemon");
      return;
    }

    setSaving(true);
    setError("");

    const members = selectedPokemon.map((p, i) => ({
      pokemonId: p.id,
      slot: i + 1,
    }));

    const url = teamId ? `/api/teams/${teamId}` : "/api/teams";
    const method = teamId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName, members }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save team");
        setSaving(false);
        return;
      }

      router.push("/teams");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#16213e] rounded-xl p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Team Info</h2>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter team name..."
          maxLength={50}
          className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#e94560] focus:outline-none focus:ring-1 focus:ring-[#e94560] transition-colors"
        />
      </div>

      <div className="bg-[#16213e] rounded-xl p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">
          Your Roster ({selectedPokemon.length}/6)
        </h2>
        <div className="grid grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => {
            const pokemon = selectedPokemon[i];
            return (
              <div
                key={i}
                className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                  pokemon
                    ? "border-[#EAB308] bg-[#1a2a4e]"
                    : "border-gray-700 bg-[#0f0f1a]"
                }`}
              >
                {pokemon ? (
                  <div
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={() => togglePokemon(pokemon)}
                  >
                    <Image
                      src={pokemon.artworkUrl}
                      alt={pokemon.name}
                      width={64}
                      height={64}
                      className="group-hover:opacity-50 transition-opacity"
                    />
                    <span className="text-[10px] text-gray-300 capitalize">
                      {pokemon.name}
                    </span>
                    <div className="flex gap-0.5 mt-0.5">
                      <TypeBadge type={pokemon.type1} />
                    </div>
                    <span className="text-[8px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to remove
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-600 text-xs">Slot {i + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || selectedPokemon.length !== 6 || !teamName.trim()}
        className="w-full bg-[#EAB308] hover:bg-[#ca9a06] disabled:opacity-30 disabled:cursor-not-allowed text-[#0f0f1a] font-bold py-3 rounded-xl transition-colors text-lg"
      >
        {saving
          ? "Saving..."
          : teamId
          ? "Update Team"
          : "Create Team"}
      </button>

      <div className="bg-[#16213e] rounded-xl p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Choose Pokemon</h2>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Pokemon..."
            className="flex-1 bg-[#0f0f1a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#e94560] focus:outline-none text-sm"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0f0f1a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#e94560] focus:outline-none text-sm"
          >
            <option value="">All Types</option>
            {POKEMON_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-[500px] overflow-y-auto pr-2">
          {filtered.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              selected={selectedPokemon.some((p) => p.id === pokemon.id)}
              onClick={() => togglePokemon(pokemon)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No Pokemon found</p>
        )}
      </div>
    </div>
  );
}
