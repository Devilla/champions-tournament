"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateTournamentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxTeams, setMaxTeams] = useState(8);
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, maxTeams, startDate }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create tournament");
        setSaving(false);
        return;
      }

      const tournament = await res.json();
      router.push(`/tournaments/${tournament.id}`);
    } catch {
      setError("Something went wrong");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-pokemon text-lg text-[#EAB308] mb-8">
        Create Tournament
      </h1>

      <div className="bg-[#16213e] rounded-xl p-8 border border-gray-800">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Tournament Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#e94560] focus:outline-none focus:ring-1 focus:ring-[#e94560] transition-colors"
              placeholder="Indigo League Championship"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#e94560] focus:outline-none focus:ring-1 focus:ring-[#e94560] transition-colors resize-none"
              placeholder="Describe your tournament..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Max Teams
            </label>
            <select
              value={maxTeams}
              onChange={(e) => setMaxTeams(Number(e.target.value))}
              className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#e94560] focus:outline-none"
            >
              <option value={4}>4 Teams</option>
              <option value={8}>8 Teams</option>
              <option value={16}>16 Teams</option>
              <option value={32}>32 Teams</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Start Date
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#e94560] focus:outline-none focus:ring-1 focus:ring-[#e94560] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#EAB308] hover:bg-[#ca9a06] disabled:opacity-50 text-[#0f0f1a] font-bold py-3 rounded-xl transition-colors"
          >
            {saving ? "Creating..." : "Create Tournament"}
          </button>
        </form>
      </div>
    </div>
  );
}
