import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { useMountedNow } from "@/hooks/use-now";

export const Route = createFileRoute("/sla-tracker")({
  head: () => ({
    meta: [{ title: "SLA Tracker — Gharpayy" }, { name: "description", content: "Follow-ups ranked by how overdue they are, with real-time SLA breach flags." }],
  }),
  component: SlaTrackerPage,
});

const SLA_HOURS = 24;

function SlaTrackerPage() {
  const { followUps, leads, tcms, completeFollowUp } = useApp();
  const [, mounted] = useMountedNow();

  const ranked = useMemo(() => {
    const now = Date.now();
    return followUps
      .filter((f) => !f.done)
      .map((f) => {
        const dueMs = new Date(f.dueAt).getTime();
        const hoursOverdue = (now - dueMs) / (1000 * 60 * 60);
        const breached = hoursOverdue > SLA_HOURS;
        const lead = leads.find((l) => l.id === f.leadId);
        const tcm = tcms.find((t) => t.id === f.tcmId);
        return { f, hoursOverdue, breached, lead, tcm };
      })
      .sort((a, b) => b.hoursOverdue - a.hoursOverdue);
  }, [followUps, leads, tcms]);

  const breachedCount = ranked.filter((r) => r.breached).length;

  return (
    <AppShell>
      <div className="space-y-4">
        <header className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">SLA Tracker</h1>
            <p className="text-sm text-muted-foreground">{ranked.length} open follow-ups · SLA is {SLA_HOURS}h from due time</p>
          </div>
          {breachedCount > 0 && (
            <div className="rounded-full bg-destructive/10 text-destructive text-xs font-semibold px-3 py-1">
              {breachedCount} breached
            </div>
          )}
        </header>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border bg-muted/40">
            <div className="col-span-3">Lead</div>
            <div className="col-span-3">Reason</div>
            <div className="col-span-2">Assigned</div>
            <div className="col-span-2">Due</div>
            <div className="col-span-1">SLA</div>
            <div className="col-span-1 text-right">Action</div>
          </div>
          <div className="divide-y divide-border">
            {ranked.map(({ f, breached, lead, tcm }) => (
              <div key={f.id} className="grid grid-cols-12 px-4 py-3 items-center text-sm">
                <div className="col-span-3 font-medium">{lead?.name ?? "—"}</div>
                <div className="col-span-3 text-xs text-muted-foreground">{f.reason}</div>
                <div className="col-span-2 text-xs">{tcm?.name ?? "—"}</div>
                <div className="col-span-2 text-xs">
                  {mounted ? formatDistanceToNow(new Date(f.dueAt), { addSuffix: true }) : "—"}
                </div>
                <div className="col-span-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${breached ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600"}`}>
                    {breached ? "breached" : "ok"}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <button
                    onClick={() => completeFollowUp(f.id)}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    Done
                  </button>
                </div>
              </div>
            ))}
            {ranked.length === 0 && (
              <div className="text-center py-10 text-sm text-muted-foreground">No open follow-ups — clean slate.</div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
