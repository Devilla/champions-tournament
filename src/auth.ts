import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// v4 compatibility shim: exposes auth() for server components/routes
// Replace with NextAuth v5 when upgrading: `export const { handlers, auth } = NextAuth({...})`
export async function auth() {
  return getServerSession(authOptions);
}
