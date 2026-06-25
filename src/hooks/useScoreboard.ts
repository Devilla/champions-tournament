import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface StandingEntry {
  rank: number;
  teamId: string;
  teamName: string;
  trainer: string;
  wins: number;
  losses: number;
  points: number;
  furthestRound: number;
  seed: number | null;
}

export function useScoreboard(tournamentId: string) {
  return useSWR<StandingEntry[]>(
    `/api/tournaments/${tournamentId}/scoreboard`,
    fetcher,
    { refreshInterval: 5000 }
  );
}
