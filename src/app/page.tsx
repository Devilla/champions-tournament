import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e94560]/10 via-transparent to-[#EAB308]/10" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#e94560] rounded-full border-4 border-white relative shadow-lg shadow-[#e94560]/30">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-[3px] bg-white" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-7 h-7 bg-white rounded-full border-3 border-[#1a1a2e]" />
              </div>
            </div>
          </div>
          <h1 className="font-pokemon text-2xl sm:text-3xl text-[#EAB308] mb-4 leading-relaxed">
            Pokemon Champions<br />Tournament
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Build your ultimate team of 6 Pokemon. Challenge other trainers in
            elimination-style tournaments. Climb the leaderboard and prove
            you&apos;re the very best.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-[#e94560] hover:bg-[#c73652] text-white font-bold px-8 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-[#e94560]/20"
            >
              Start Your Journey
            </Link>
            <Link
              href="/tournaments"
              className="bg-[#16213e] hover:bg-[#1a2a4e] text-white font-bold px-8 py-3 rounded-xl border border-gray-700 transition-all hover:scale-105"
            >
              View Tournaments
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#16213e] rounded-2xl p-8 border border-gray-800 hover:border-[#e94560]/30 transition-colors">
            <div className="text-4xl mb-4">⚔️</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Build Your Team
            </h3>
            <p className="text-gray-400 text-sm">
              Choose from all 151 original Pokemon. View stats, types, and
              abilities to craft the perfect roster of 6.
            </p>
          </div>
          <div className="bg-[#16213e] rounded-2xl p-8 border border-gray-800 hover:border-[#EAB308]/30 transition-colors">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Enter Tournaments
            </h3>
            <p className="text-gray-400 text-sm">
              Join or create single-elimination tournaments. Brackets are
              generated automatically with support for 4 to 32 teams.
            </p>
          </div>
          <div className="bg-[#16213e] rounded-2xl p-8 border border-gray-800 hover:border-[#3B82F6]/30 transition-colors">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Live Scoreboard
            </h3>
            <p className="text-gray-400 text-sm">
              Track match results in real-time. Watch brackets update live and
              climb the global leaderboard.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
