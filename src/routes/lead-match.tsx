import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/lead-match")({
  head: () => ({
    meta: [{ title: "Lead Matcher — Gharpayy" }, { name: "description", content: "Auto-match a lead to the best-fit vacant properties by area and budget." }],
  }),
  component: LeadMatchPage,
});

function LeadMatchPage() {
  const { leads, properties } = useApp();
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id ?? "");

  const lead = leads.find((l) => l.id === selectedLeadId);

  const matches = useMemo(() => {
    if (!lead) return [];
    return properties
      .filter((p) => p.vacantBeds > 0)
      .map((p) => {
        const areaMatch = p.area.toLowerCase() === lead.preferredArea.toLowerCase();
        const priceDiffPct = Math.abs(p.pricePerBed - lead.budget) / lead.budget;
        const withinBudget = priceDiffPct <= 0.2; // within 20%
        let score = 0;
        if (areaMatch) score += 60;
        if (withinBudget) score += 30;
        score += Math.max(0, 10 - Math.round(priceDiffPct * 10));
        return { property: p, score, areaMatch, withinBudget, priceDiffPct };
      })
      .filter((m) => m.areaMatch || m.withinBudget)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [lead, properties]);

  return (
    <AppShell>
      <div className="space-y-4">
        <header>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Lead Matcher</h1>
          <p className="text-sm text-muted-foreground">Auto-suggest the best-fit vacant properties for a lead, by area + budget.</p>
        </header>

        <div className="rounded-xl border border-border bg-card p-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Select lead</label>
          <select
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            className="mt-2 w-full max-w-sm rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} — {l.preferredArea} · ₹{(l.budget / 1000).toFixed(0)}k
              </option>
            ))}
          </select>
        </div>

        {lead && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-12 px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border bg-muted/40">
              <div className="col-span-4">Property</div>
              <div className="col-span-2">Area</div>
              <div className="col-span-2">Price/bed</div>
              <div className="col-span-2">Vacant</div>
              <div className="col-span-2 text-right">Match score</div>
            </div>
            <div className="divide-y divide-border">
              {matches.map((m) => (
                <div key={m.property.id} className="grid grid-cols-12 px-4 py-3 items-center text-sm">
                  <div className="col-span-4 font-medium">{m.property.name}</div>
                  <div className="col-span-2">
                    {m.property.area}
                    {m.areaMatch && <span className="ml-1 text-[10px] text-emerald-500">match</span>}
                  </div>
                  <div className="col-span-2">
                    ₹{(m.property.pricePerBed / 1000).toFixed(1)}k
                    {m.withinBudget && <span className="ml-1 text-[10px] text-emerald-500">in budget</span>}
                  </div>
                  <div className="col-span-2">{m.property.vacantBeds} beds</div>
                  <div className="col-span-2 text-right font-semibold">{m.score}/100</div>
                </div>
              ))}
              {matches.length === 0 && (
                <div className="text-center py-10 text-sm text-muted-foreground">No close matches — try a different lead.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
