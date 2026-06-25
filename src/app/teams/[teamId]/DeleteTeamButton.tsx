"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteTeamButton({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    await fetch(`/api/teams/${teamId}`, { method: "DELETE" });
    router.push("/teams");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Confirm Delete
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm px-4 py-2 rounded-lg border border-red-600/30 transition-colors"
    >
      Delete
    </button>
  );
}
