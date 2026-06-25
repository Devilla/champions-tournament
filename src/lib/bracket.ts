import { prisma } from "./prisma";

export async function generateBracket(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { registrations: { include: { team: true } } },
  });

  if (!tournament) throw new Error("Tournament not found");
  if (tournament.status !== "registration")
    throw new Error("Tournament is not in registration phase");

  const teamCount = tournament.registrations.length;
  if (teamCount < 2) throw new Error("Need at least 2 teams");

  const bracketSize = Math.pow(2, Math.ceil(Math.log2(teamCount)));
  const totalRounds = Math.log2(bracketSize);

  const shuffled = [...tournament.registrations].sort(
    () => Math.random() - 0.5
  );

  for (let i = 0; i < shuffled.length; i++) {
    await prisma.tournamentRegistration.update({
      where: { id: shuffled[i].id },
      data: { seed: i + 1 },
    });
  }

  await prisma.match.deleteMany({ where: { tournamentId } });

  const matches = [];

  for (let round = 1; round <= totalRounds; round++) {
    const matchesInRound = bracketSize / Math.pow(2, round);
    for (let pos = 0; pos < matchesInRound; pos++) {
      const matchData: {
        tournamentId: string;
        round: number;
        position: number;
        team1Id?: string;
        team2Id?: string;
        status: string;
      } = {
        tournamentId,
        round,
        position: pos,
        status: "pending",
      };

      if (round === 1) {
        const idx1 = pos * 2;
        const idx2 = pos * 2 + 1;
        matchData.team1Id = shuffled[idx1]?.teamId ?? undefined;
        matchData.team2Id = shuffled[idx2]?.teamId ?? undefined;

        if (matchData.team1Id && matchData.team2Id) {
          matchData.status = "ready";
        }
      }

      matches.push(matchData);
    }
  }

  for (const match of matches) {
    await prisma.match.create({ data: match });
  }

  // Handle byes in round 1
  const round1Matches = await prisma.match.findMany({
    where: { tournamentId, round: 1 },
    orderBy: { position: "asc" },
  });

  for (const match of round1Matches) {
    if (match.team1Id && !match.team2Id) {
      await advanceWinner(match.id, match.team1Id);
    } else if (!match.team1Id && match.team2Id) {
      await advanceWinner(match.id, match.team2Id);
    }
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: "in_progress" },
  });

  return prisma.match.findMany({
    where: { tournamentId },
    include: { team1: true, team2: true, winner: true },
    orderBy: [{ round: "asc" }, { position: "asc" }],
  });
}

export async function advanceWinner(matchId: string, winnerId: string) {
  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      winnerId,
      status: "completed",
      completedAt: new Date(),
    },
  });

  const totalRounds = await prisma.match
    .findMany({
      where: { tournamentId: match.tournamentId },
      select: { round: true },
    })
    .then((m) => Math.max(...m.map((x) => x.round)));

  if (match.round >= totalRounds) {
    await prisma.tournament.update({
      where: { id: match.tournamentId },
      data: { status: "completed" },
    });
    return;
  }

  const nextRound = match.round + 1;
  const nextPosition = Math.floor(match.position / 2);
  const isFirstTeam = match.position % 2 === 0;

  const nextMatch = await prisma.match.findUnique({
    where: {
      tournamentId_round_position: {
        tournamentId: match.tournamentId,
        round: nextRound,
        position: nextPosition,
      },
    },
  });

  if (nextMatch) {
    const updateData = isFirstTeam
      ? { team1Id: winnerId }
      : { team2Id: winnerId };

    const updated = await prisma.match.update({
      where: { id: nextMatch.id },
      data: updateData,
    });

    if (updated.team1Id && updated.team2Id) {
      await prisma.match.update({
        where: { id: nextMatch.id },
        data: { status: "ready" },
      });
    }
  }
}
