import { prisma } from "./prisma";

const GUEST_EMAIL = "guest@champions-tournament.local";

export async function getOrCreateGuest() {
  return prisma.user.upsert({
    where: { email: GUEST_EMAIL },
    update: {},
    create: {
      username: "Guest",
      email: GUEST_EMAIL,
      hashedPassword: "",
    },
  });
}
