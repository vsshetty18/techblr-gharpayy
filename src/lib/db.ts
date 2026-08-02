import { supabase } from "./supabase";
import type { Lead, Property, FollowUp } from "./types";

function rowToLead(r: any): Lead {
  return {
    id: r.id, name: r.name, phone: r.phone, source: r.source,
    budget: r.budget, moveInDate: r.move_in_date, preferredArea: r.preferred_area,
    assignedTcmId: r.assigned_tcm_id, stage: r.stage, intent: r.intent,
    confidence: r.confidence, tags: r.tags ?? [],
    nextFollowUpAt: r.next_follow_up_at, responseSpeedMins: r.response_speed_mins,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function leadToRow(l: Lead) {
  return {
    id: l.id, name: l.name, phone: l.phone, source: l.source,
    budget: l.budget, move_in_date: l.moveInDate, preferred_area: l.preferredArea,
    assigned_tcm_id: l.assignedTcmId, stage: l.stage, intent: l.intent,
    confidence: l.confidence, tags: l.tags,
    next_follow_up_at: l.nextFollowUpAt, response_speed_mins: l.responseSpeedMins,
    created_at: l.createdAt, updated_at: l.updatedAt,
  };
}

function rowToProperty(r: any): Property {
  return {
    id: r.id, name: r.name, area: r.area,
    totalBeds: r.total_beds, vacantBeds: r.vacant_beds,
    daysSinceLastBooking: r.days_since_last_booking, pricePerBed: r.price_per_bed,
  };
}

function propertyToRow(p: Property) {
  return {
    id: p.id, name: p.name, area: p.area,
    total_beds: p.totalBeds, vacant_beds: p.vacantBeds,
    days_since_last_booking: p.daysSinceLastBooking, price_per_bed: p.pricePerBed,
  };
}

function rowToFollowUp(r: any): FollowUp {
  return {
    id: r.id, leadId: r.lead_id, tcmId: r.tcm_id, tourId: r.tour_id ?? undefined,
    dueAt: r.due_at, priority: r.priority, reason: r.reason, done: r.done,
  };
}

function followUpToRow(f: FollowUp) {
  return {
    id: f.id, lead_id: f.leadId, tcm_id: f.tcmId, tour_id: f.tourId ?? null,
    due_at: f.dueAt, priority: f.priority, reason: f.reason, done: f.done,
  };
}

export async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) { console.error("fetchLeads", error); return []; }
  return (data ?? []).map(rowToLead);
}

export async function fetchProperties(): Promise<Property[]> {
  const { data, error } = await supabase.from("properties").select("*");
  if (error) { console.error("fetchProperties", error); return []; }
  return (data ?? []).map(rowToProperty);
}

export async function fetchFollowUps(): Promise<FollowUp[]> {
  const { data, error } = await supabase.from("follow_ups").select("*").order("due_at", { ascending: true });
  if (error) { console.error("fetchFollowUps", error); return []; }
  return (data ?? []).map(rowToFollowUp);
}

export async function insertLead(lead: Lead) {
  const { error } = await supabase.from("leads").insert(leadToRow(lead));
  if (error) console.error("insertLead", error);
}

export async function updateLeadRow(leadId: string, patch: Record<string, any>) {
  const { error } = await supabase.from("leads").update(patch).eq("id", leadId);
  if (error) console.error("updateLeadRow", error);
}

export async function insertProperty(p: Property) {
  const { error } = await supabase.from("properties").insert(propertyToRow(p));
  if (error) console.error("insertProperty", error);
}

export async function updatePropertyRow(id: string, patch: Record<string, any>) {
  const { error } = await supabase.from("properties").update(patch).eq("id", id);
  if (error) console.error("updatePropertyRow", error);
}

export async function insertFollowUp(f: FollowUp) {
  const { error } = await supabase.from("follow_ups").insert(followUpToRow(f));
  if (error) console.error("insertFollowUp", error);
}

export async function updateFollowUpRow(id: string, patch: Record<string, any>) {
  const { error } = await supabase.from("follow_ups").update(patch).eq("id", id);
  if (error) console.error("updateFollowUpRow", error);
}
