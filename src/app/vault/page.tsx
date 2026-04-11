import { createSupabaseServer } from "@/lib/supabase-server";
import Link from "next/link";

export default async function VaultDashboard() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("email", user?.email ?? "")
    .single();

  const clientName = client?.client_name ?? "Your Vault";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-sans font-bold mb-6">{clientName}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Context Files", value: "—", color: "text-blue" },
          { label: "Decisions", value: "—", color: "text-green" },
          { label: "Research", value: "—", color: "text-amber" },
          { label: "Last Updated", value: "—", color: "text-muted" },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface border border-border rounded-lg p-4">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/vault/chat"
          className="bg-surface border border-blue/30 rounded-lg p-6 hover:border-blue/60 transition-colors"
        >
          <h2 className="text-lg font-sans font-bold text-blue">Pocket Architect</h2>
          <p className="text-muted text-sm mt-2">
            Ask questions, request research, draft content — all grounded in your vault context.
          </p>
        </Link>

        <Link
          href="/vault/files"
          className="bg-surface border border-border rounded-lg p-6 hover:border-muted/30 transition-colors"
        >
          <h2 className="text-lg font-sans font-bold">Browse Files</h2>
          <p className="text-muted text-sm mt-2">
            View your codified expertise — decisions, research, outputs, and context files.
          </p>
        </Link>
      </div>
    </div>
  );
}
