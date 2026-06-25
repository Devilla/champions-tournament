import TeamBuilder from "@/components/teams/TeamBuilder";

export default function NewTeamPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-pokemon text-lg text-[#EAB308] mb-8">
        Create Team
      </h1>
      <TeamBuilder />
    </div>
  );
}
