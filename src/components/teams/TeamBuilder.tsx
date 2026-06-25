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

type MemberDetails = {
  heldItem: string;
  moves: [string, string, string, string];
};

const emptyDetails = (): MemberDetails => ({
  heldItem: "",
  moves: ["", "", "", ""],
});

interface TeamMemberInit {
  pokemonId: number;
  slot: number;
  heldItem?: string | null;
  move1?: string | null;
  move2?: string | null;
  move3?: string | null;
  move4?: string | null;
}

interface TeamBuilderProps {
  initialName?: string;
  initialMembers?: TeamMemberInit[];
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
  const [slots, setSlots] = useState<(PokemonData | null)[]>(Array(6).fill(null));
  const [memberDetails, setMemberDetails] = useState<MemberDetails[]>(
    Array.from({ length: 6 }, emptyDetails)
  );
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (allPokemon && initialMembers.length > 0 && !initialized) {
    const newSlots: (PokemonData | null)[] = Array(6).fill(null);
    const newDetails: MemberDetails[] = Array.from({ length: 6 }, emptyDetails);

    for (const m of initialMembers) {
      const pokemon = allPokemon.find((p) => p.id === m.pokemonId);
      if (pokemon) {
        newSlots[m.slot - 1] = pokemon;
        newDetails[m.slot - 1] = {
          heldItem: m.heldItem ?? "",
          moves: [m.move1 ?? "", m.move2 ?? "", m.move3 ?? "", m.move4 ?? ""],
        };
      }
    }

    setSlots(newSlots);
    setMemberDetails(newDetails);
    setInitialized(true);
  }

  const filtered = useMemo(() => {
    if (!allPokemon) return [];
    return allPokemon.filter((p) => {
      const matchesSearch = !search || p.name.includes(search.toLowerCase());
      const matchesType = !typeFilter || p.type1 === typeFilter || p.type2 === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [allPokemon, search, typeFilter]);

  function togglePokemon(pokemon: PokemonData) {
    const slotIndex = slots.findIndex((p) => p?.id === pokemon.id);
    if (slotIndex !== -1) {
      const newSlots = [...slots];
      newSlots[slotIndex] = null;
      const newDetails = [...memberDetails];
      newDetails[slotIndex] = emptyDetails();
      setSlots(newSlots);
      setMemberDetails(newDetails);
      if (activeSlot === slotIndex) setActiveSlot(null);
    } else {
      const emptyIndex = slots.findIndex((p) => p === null);
      if (emptyIndex !== -1) {
        const newSlots = [...slots];
        newSlots[emptyIndex] = pokemon;
        setSlots(newSlots);
      }
    }
  }

  function removeSlot(index: number) {
    const newSlots = [...slots];
    newSlots[index] = null;
    const newDetails = [...memberDetails];
    newDetails[index] = emptyDetails();
    setSlots(newSlots);
    setMemberDetails(newDetails);
    if (activeSlot === index) setActiveSlot(null);
  }

  function updateDetail(
    slotIndex: number,
    field: "heldItem" | "move",
    value: string,
    moveIndex?: number
  ) {
    const newDetails = memberDetails.map((d, i) => {
      if (i !== slotIndex) return d;
      if (field === "heldItem") return { ...d, heldItem: value };
      const newMoves = [...d.moves] as [string, string, string, string];
      newMoves[moveIndex!] = value;
      return { ...d, moves: newMoves };
    });
    setMemberDetails(newDetails);
  }

  async function handleSave() {
    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }
    const filledSlots = slots.filter(Boolean);
    if (filledSlots.length !== 6) {
      setError("Select exactly 6 Pokémon");
      return;
    }

    setSaving(true);
    setError("");

    const members = slots.map((pokemon, i) => ({
      pokemonId: pokemon!.id,
      slot: i + 1,
      heldItem: memberDetails[i].heldItem || null,
      move1: memberDetails[i].moves[0] || null,
      move2: memberDetails[i].moves[1] || null,
      move3: memberDetails[i].moves[2] || null,
      move4: memberDetails[i].moves[3] || null,
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

  const filledCount = slots.filter(Boolean).length;
  const activePokemon = activeSlot !== null ? slots[activeSlot] : null;
  const activeDetails = activeSlot !== null ? memberDetails[activeSlot] : null;

  return (
    <div className="space-y-6">
      {/* Team name */}
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

      {/* Roster slots */}
      <div className="bg-[#16213e] rounded-xl p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-1">
          Your Roster ({filledCount}/6)
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Click a filled slot to configure its held item and moves.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {slots.map((pokemon, i) => (
            <div
              key={i}
              className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                pokemon
                  ? activeSlot === i
                    ? "border-[#e94560] bg-[#1a2a4e] cursor-pointer"
                    : "border-[#EAB308] bg-[#1a2a4e] cursor-pointer hover:border-[#e94560]"
                  : "border-dashed border-gray-700 bg-[#0f0f1a]"
              }`}
              onClick={() => pokemon && setActiveSlot(activeSlot === i ? null : i)}
            >
              {pokemon ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSlot(i); }}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gray-700 hover:bg-red-500 text-white text-[9px] flex items-center justify-center transition-colors z-10"
                  >
                    ✕
                  </button>
                  <Image
                    src={pokemon.artworkUrl}
                    alt={pokemon.name}
                    width={52}
                    height={52}
                  />
                  <span className="text-[9px] text-gray-300 capitalize truncate w-full text-center px-1">
                    {pokemon.name}
                  </span>
                  {(memberDetails[i].heldItem || memberDetails[i].moves.some(Boolean)) && (
                    <div className="flex gap-0.5 mt-0.5">
                      {memberDetails[i].heldItem && (
                        <span className="text-[7px] bg-purple-900/60 text-purple-300 px-1 rounded">item</span>
                      )}
                      {memberDetails[i].moves.some(Boolean) && (
                        <span className="text-[7px] bg-blue-900/60 text-blue-300 px-1 rounded">moves</span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-gray-600 text-xs">Slot {i + 1}</span>
              )}
            </div>
          ))}
        </div>

        {/* Inline slot editor */}
        {activeSlot !== null && activePokemon && activeDetails && (
          <div className="mt-4 bg-[#0f0f1a] rounded-xl p-4 border border-[#e94560]/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Image
                  src={activePokemon.spriteUrl || activePokemon.artworkUrl}
                  alt={activePokemon.name}
                  width={40}
                  height={40}
                />
                <span className="text-white font-semibold capitalize">
                  {activePokemon.name}
                </span>
                <TypeBadge type={activePokemon.type1} />
                {activePokemon.type2 && <TypeBadge type={activePokemon.type2} />}
              </div>
              <button
                onClick={() => setActiveSlot(null)}
                className="text-gray-500 hover:text-white transition-colors text-sm"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-purple-400 font-medium uppercase tracking-wide mb-1 block">
                  Held Item
                </label>
                <input
                  type="text"
                  value={activeDetails.heldItem}
                  onChange={(e) => updateDetail(activeSlot, "heldItem", e.target.value)}
                  placeholder="e.g. Life Orb, Choice Scarf…"
                  maxLength={100}
                  className="w-full bg-[#16213e] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-blue-400 font-medium uppercase tracking-wide mb-1 block">
                  Moves
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Move 1", "Move 2", "Move 3", "Move 4"] as const).map((label, mi) => (
                    <input
                      key={mi}
                      type="text"
                      value={activeDetails.moves[mi]}
                      onChange={(e) => updateDetail(activeSlot, "move", e.target.value, mi)}
                      placeholder={label}
                      maxLength={100}
                      className="bg-[#16213e] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || filledCount !== 6 || !teamName.trim()}
        className="w-full bg-[#EAB308] hover:bg-[#ca9a06] disabled:opacity-30 disabled:cursor-not-allowed text-[#0f0f1a] font-bold py-3 rounded-xl transition-colors text-lg"
      >
        {saving ? "Saving…" : teamId ? "Update Team" : "Create Team"}
      </button>

      {/* Pokémon picker */}
      <div className="bg-[#16213e] rounded-xl p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Choose Pokémon</h2>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Pokémon…"
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
              selected={slots.some((p) => p?.id === pokemon.id)}
              onClick={() => togglePokemon(pokemon)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No Pokémon found</p>
        )}
      </div>
    </div>
  );
}
