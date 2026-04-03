"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  ArrowRight,
  ArrowLeftRight,
} from "lucide-react";
import {
  updateMatch,
  updateMatchStatus,
  deleteMatch as deleteMatchAction,
  createMatch,
} from "@/app/dashboard/admin/matches/actions";

interface MatchRow {
  id: string;
  dog_id: string;
  caregiver_id: string;
  location_score: number | null;
  size_score: number | null;
  temperament_score: number | null;
  availability_score: number | null;
  experience_score: number | null;
  total_score: number | null;
  compatibility_tier: string | null;
  match_status: string;
  created_at: string;
  dog: { name: string; breed: string | null; owner: { full_name: string | null } | null } | null;
  caregiver: { caregiver_user: { full_name: string | null } | null } | null;
}

interface MatchForm {
  location_score: number | null;
  size_score: number | null;
  temperament_score: number | null;
  availability_score: number | null;
  experience_score: number | null;
  match_status: string;
}

const STATUSES = ["suggested", "contacted", "accepted", "rejected"] as const;

const STATUS_STYLE: Record<string, string> = {
  suggested: "bg-gray-100 text-gray-600",
  contacted: "bg-blue-50 text-blue-600",
  accepted: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-500",
};

const TIER_STYLE: Record<string, string> = {
  high: "bg-green-50 text-green-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-red-50 text-red-500",
};

const TIER_BAR: Record<string, string> = {
  high: "bg-green-500",
  medium: "bg-amber-500",
  low: "bg-red-400",
};

const SCORE_FIELDS = [
  { key: "location_score" as const, label: "Location" },
  { key: "size_score" as const, label: "Size" },
  { key: "temperament_score" as const, label: "Temperament" },
  { key: "availability_score" as const, label: "Availability" },
  { key: "experience_score" as const, label: "Experience" },
];

const FONT = { fontFamily: "Inter, sans-serif" } as const;

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface DogOption {
  id: string;
  name: string;
  owner: { full_name: string | null } | null;
}

interface CaregiverOption {
  id: string;
  full_name: string;
}

interface Props {
  initialMatches: MatchRow[];
  dogs: DogOption[];
  caregivers: CaregiverOption[];
}

export function AdminMatchesPage({ initialMatches, dogs, caregivers }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(10);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchRow | null>(null);
  const [deletingMatch, setDeletingMatch] = useState<MatchRow | null>(null);
  const [createForm, setCreateForm] = useState({
    dog_id: "",
    caregiver_id: "",
    location_score: null as number | null,
    size_score: null as number | null,
    temperament_score: null as number | null,
    availability_score: null as number | null,
    experience_score: null as number | null,
    match_status: "suggested",
  });
  const [form, setForm] = useState<MatchForm>({
    location_score: null,
    size_score: null,
    temperament_score: null,
    availability_score: null,
    experience_score: null,
    match_status: "suggested",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasActiveFilters =
    search !== "" || statusFilter !== null || tierFilter !== null;

  const filtered = initialMatches.filter((m) => {
    if (search) {
      const q = search.toLowerCase();
      const dogName = m.dog?.name?.toLowerCase() ?? "";
      const cgName =
        m.caregiver?.caregiver_user?.full_name?.toLowerCase() ?? "";
      const ownerName = m.dog?.owner?.full_name?.toLowerCase() ?? "";
      if (!dogName.includes(q) && !cgName.includes(q) && !ownerName.includes(q))
        return false;
    }
    if (statusFilter && m.match_status !== statusFilter) return false;
    if (tierFilter && m.compatibility_tier !== tierFilter) return false;
    return true;
  });

  const visible = filtered.slice(0, showCount);
  const hasMore = filtered.length > showCount;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(null);
    setTierFilter(null);
  };

  const openEdit = (m: MatchRow) => {
    setEditingMatch(m);
    setForm({
      location_score: m.location_score,
      size_score: m.size_score,
      temperament_score: m.temperament_score,
      availability_score: m.availability_score,
      experience_score: m.experience_score,
      match_status: m.match_status,
    });
    setError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    const result = await updateMatch(editingMatch!.id, form);
    setIsSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setEditingMatch(null);
  };

  const handleQuickStatus = async (matchId: string, status: string) => {
    setStatusUpdatingId(matchId);
    await updateMatchStatus(matchId, status);
    setStatusUpdatingId(null);
  };

  const handleDelete = async () => {
    if (!deletingMatch) return;
    setIsDeleting(true);
    setError(null);
    const result = await deleteMatchAction(deletingMatch.id);
    setIsDeleting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setDeletingMatch(null);
  };

  const handleCreate = async () => {
    if (!createForm.dog_id || !createForm.caregiver_id) {
      setError("Please select a dog and caregiver");
      return;
    }
    setIsSaving(true);
    setError(null);
    const result = await createMatch({
      dog_id: createForm.dog_id,
      caregiver_id: createForm.caregiver_id,
      location_score: createForm.location_score,
      size_score: createForm.size_score,
      temperament_score: createForm.temperament_score,
      availability_score: createForm.availability_score,
      experience_score: createForm.experience_score,
      match_status: createForm.match_status,
    });
    setIsSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setCreateOpen(false);
    setCreateForm({
      dog_id: "",
      caregiver_id: "",
      location_score: null,
      size_score: null,
      temperament_score: null,
      availability_score: null,
      experience_score: null,
      match_status: "suggested",
    });
  };

  return (
    <div className="space-y-5">
      {/* ── Search + Create ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by dog, owner, or caregiver…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#5F7E9D] focus:ring-1 focus:ring-[#5F7E9D]/20 transition-all"
            style={FONT}
          />
        </div>
        <button
          onClick={() => {
            setCreateOpen(true);
            setError(null);
            setCreateForm({
              dog_id: "",
              caregiver_id: "",
              location_score: null,
              size_score: null,
              temperament_score: null,
              availability_score: null,
              experience_score: null,
              match_status: "suggested",
            });
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#5F7E9D] rounded-xl hover:bg-[#4e6d8c] transition-colors shrink-0"
          style={FONT}
        >
          <Plus className="h-4 w-4" />
          Create Match
        </button>
      </div>

      {/* ── Filter Cards ── */}
      <div className="grid grid-cols-2 gap-3">
        <FilterCard label="Status">
          <Pill active={statusFilter === null} onClick={() => setStatusFilter(null)}>
            All
          </Pill>
          {STATUSES.map((s) => (
            <Pill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {cap(s)}
            </Pill>
          ))}
        </FilterCard>

        <FilterCard label="Tier">
          <Pill active={tierFilter === null} onClick={() => setTierFilter(null)}>
            All
          </Pill>
          {["high", "medium", "low"].map((t) => (
            <Pill key={t} active={tierFilter === t} onClick={() => setTierFilter(t)}>
              {cap(t)}
            </Pill>
          ))}
        </FilterCard>
      </div>

      {/* ── Count ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500" style={FONT}>
          {filtered.length === initialMatches.length
            ? `${initialMatches.length} ${initialMatches.length === 1 ? "match" : "matches"}`
            : `${filtered.length} of ${initialMatches.length} matches`}
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-[#5F7E9D] font-medium hover:underline"
            style={FONT}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {visible.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-[#260900] border-b border-gray-100">
                  {["Dog", "Owner", "Caregiver", "Score", "Tier", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[11px] font-semibold text-[#fff] uppercase tracking-wider"
                        style={FONT}
                      >
                        {h}
                      </th>
                    )
                  )}
                  <th
                    className="text-right px-4 py-3 text-[11px] font-semibold text-[#fff] uppercase tracking-wider"
                    style={FONT}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => {
                  const total = m.total_score ?? 0;
                  const tier = m.compatibility_tier ?? "low";
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-sm font-medium text-[#2F3E4E]" style={FONT}>
                            {m.dog?.name ?? "—"}
                          </span>
                          {m.dog?.breed && (
                            <p className="text-[11px] text-gray-400" style={FONT}>
                              {m.dog.breed}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600" style={FONT}>
                        {m.dog?.owner?.full_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600" style={FONT}>
                        {m.caregiver?.caregiver_user?.full_name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${TIER_BAR[tier] ?? "bg-gray-400"}`}
                              style={{ width: `${(total / 25) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 tabular-nums" style={FONT}>
                            {total}/25
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full ${TIER_STYLE[tier] ?? "bg-gray-100 text-gray-500"}`}
                          style={FONT}
                        >
                          {cap(tier)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusSelect
                          value={m.match_status}
                          loading={statusUpdatingId === m.id}
                          onChange={(s) => handleQuickStatus(m.id, s)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(m)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#5F7E9D] transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingMatch(m);
                              setError(null);
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyBlock total={initialMatches.length} />
        )}
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden space-y-3">
        {visible.length > 0
          ? visible.map((m) => {
              const total = m.total_score ?? 0;
              const tier = m.compatibility_tier ?? "low";
              return (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#2F3E4E]" style={FONT}>
                        {m.dog?.name ?? "Unknown Dog"}
                      </h3>
                      {m.dog?.breed && (
                        <p className="text-[11px] text-gray-400" style={FONT}>
                          {m.dog.breed}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0 ml-3">
                      <button
                        onClick={() => openEdit(m)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#5F7E9D] transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingMatch(m);
                          setError(null);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3" style={FONT}>
                    <span className="truncate">{m.dog?.owner?.full_name ?? "—"}</span>
                    <ArrowRight className="h-3 w-3 text-gray-300 shrink-0" />
                    <span className="truncate">
                      {m.caregiver?.caregiver_user?.full_name ?? "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${TIER_BAR[tier] ?? "bg-gray-400"}`}
                        style={{ width: `${(total / 25) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 tabular-nums shrink-0" style={FONT}>
                      {total}/25
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${TIER_STYLE[tier]}`}
                        style={FONT}
                      >
                        {cap(tier)}
                      </span>
                      <StatusSelect
                        value={m.match_status}
                        loading={statusUpdatingId === m.id}
                        onChange={(s) => handleQuickStatus(m.id, s)}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400" style={FONT}>
                      {fmtDate(m.created_at)}
                    </span>
                  </div>
                </div>
              );
            })
          : initialMatches.length === 0 && <EmptyBlock total={0} />}

        {visible.length === 0 && initialMatches.length > 0 && (
          <EmptyBlock total={initialMatches.length} />
        )}
      </div>

      {/* ── View More ── */}
      {hasMore && (
        <div className="flex justify-center pt-1">
          <button
            onClick={() => setShowCount((c) => c + 10)}
            className="px-6 py-2.5 text-sm font-medium text-[#F3B443] bg-white border-2 border-[#F3B443] rounded-xl hover:bg-gray-50 transition-colors"
            style={FONT}
          >
            View More · {filtered.length - showCount} remaining
          </button>
        </div>
      )}

      {/* ── Create Match Modal ── */}
      {createOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[5vh] px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isSaving && setCreateOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-base font-semibold text-[#2F3E4E]" style={FONT}>
                Create Match
              </h2>
              <button
                onClick={() => !isSaving && setCreateOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {error && (
                <div
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600"
                  style={FONT}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5" style={FONT}>
                  Dog *
                </label>
                <select
                  value={createForm.dog_id}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, dog_id: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#5F7E9D] focus:ring-1 focus:ring-[#5F7E9D]/20"
                  style={FONT}
                >
                  <option value="">Select a dog…</option>
                  {dogs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                      {d.owner?.full_name ? ` (${d.owner.full_name})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5" style={FONT}>
                  Caregiver *
                </label>
                <select
                  value={createForm.caregiver_id}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, caregiver_id: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#5F7E9D] focus:ring-1 focus:ring-[#5F7E9D]/20"
                  style={FONT}
                >
                  <option value="">Select a caregiver…</option>
                  {caregivers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3" style={FONT}>
                  Score Breakdown
                </p>
                <div className="space-y-3">
                  {SCORE_FIELDS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <label className="text-xs font-medium text-gray-600 w-24 shrink-0" style={FONT}>
                        {label}
                      </label>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() =>
                              setCreateForm((f) => ({
                                ...f,
                                [key]: (f[key] === n ? null : n) as number | null,
                              }))
                            }
                            className={`w-8 h-8 rounded-lg text-xs font-medium border transition-colors ${
                              createForm[key] === n
                                ? "bg-[#F3B443] text-white border-[#F3B443]"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                            }`}
                            style={FONT}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3" style={FONT}>
                  Match Status
                </p>
                <div className="flex gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setCreateForm((f) => ({ ...f, match_status: s }))
                      }
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
                        createForm.match_status === s
                          ? "bg-[#F3B443] text-white border-[#F3B443]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                      style={FONT}
                    >
                      {cap(s)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setCreateOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-[#F3B443] bg-white border-2 border-[#F3B443] rounded-xl hover:transition-colors disabled:opacity-50"
                style={FONT}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isSaving}
                className="px-5 py-2 text-sm font-medium text-white bg-[#F3B443] border-2 border-[#F3B443] rounded-xl hover:transition-colors disabled:opacity-50 flex items-center gap-2"
                style={FONT}
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create Match"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingMatch && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[5vh] px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isSaving && setEditingMatch(null)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base font-semibold text-[#260900]" style={FONT}>
                  Edit Match
                </h2>
                <p className="text-xs text-gray-400 mt-0.5" style={FONT}>
                  {editingMatch.dog?.name ?? "Dog"} →{" "}
                  {editingMatch.caregiver?.caregiver_user?.full_name ?? "Caregiver"}
                </p>
              </div>
              <button
                onClick={() => !isSaving && setEditingMatch(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {error && (
                <div
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600"
                  style={FONT}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3" style={FONT}>
                  Score Breakdown
                </p>
                <div className="space-y-3">
                  {SCORE_FIELDS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <label className="text-xs font-medium text-gray-600 w-24 shrink-0" style={FONT}>
                        {label}
                      </label>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, [key]: f[key] === n ? null : n }))}
                            className={`w-8 h-8 rounded-lg text-xs font-medium border transition-colors ${
                              form[key] === n
                                ? "bg-[#F3B443] text-white border-[#F3B443]"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                            }`}
                            style={FONT}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500" style={FONT}>
                    Total
                  </span>
                  <span className="text-sm font-semibold text-[#2F3E4E] tabular-nums" style={FONT}>
                    {(form.location_score ?? 0) +
                      (form.size_score ?? 0) +
                      (form.temperament_score ?? 0) +
                      (form.availability_score ?? 0) +
                      (form.experience_score ?? 0)}
                    /25
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3" style={FONT}>
                  Match Status
                </p>
                <div className="flex gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, match_status: s }))}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
                        form.match_status === s
                          ? "bg-[#F3B443] text-white border-[#F3B443]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                      style={FONT}
                    >
                      {cap(s)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setEditingMatch(null)}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-[#F3B443] bg-white border-2 border-[#F3B443] rounded-xl hover:transition-colors disabled:opacity-50"
                style={FONT}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 text-sm font-medium text-white bg-[#F3B443] border-2 border-[#F3B443] rounded-xl hover:transition-colors disabled:opacity-50 flex items-center gap-2"
                style={FONT}
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deletingMatch && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isDeleting && setDeletingMatch(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-semibold text-[#2F3E4E] mb-2" style={FONT}>
              Delete Match
            </h3>
            <p className="text-sm text-gray-500 mb-1" style={FONT}>
              Delete the match between{" "}
              <span className="font-medium text-[#2F3E4E]">
                {deletingMatch.dog?.name ?? "this dog"}
              </span>{" "}
              and{" "}
              <span className="font-medium text-[#2F3E4E]">
                {deletingMatch.caregiver?.caregiver_user?.full_name ?? "this caregiver"}
              </span>
              ?
            </p>
            <p className="text-xs text-gray-400 mb-5" style={FONT}>
              This action cannot be undone.
            </p>

            {error && (
              <div
                className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600"
                style={FONT}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingMatch(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                style={FONT}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                style={FONT}
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Shared sub-components ── */

function StatusSelect({
  value,
  loading,
  onChange,
}: {
  value: string;
  loading: boolean;
  onChange: (s: string) => void;
}) {
  return (
    <select
      value={value}
      disabled={loading}
      onChange={(e) => onChange(e.target.value)}
      className={`px-2 py-0.5 text-[11px] font-medium rounded-full border-0 outline-none cursor-pointer transition-colors disabled:opacity-50 ${STATUS_STYLE[value] ?? "bg-gray-100 text-gray-600"}`}
      style={FONT}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {cap(s)}
        </option>
      ))}
    </select>
  );
}

function FilterCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3.5">
      <p
        className="text-[11px] font-semibold text-[#260900] uppercase tracking-wider mb-2"
        style={FONT}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
        active
          ? "bg-[#F3B443] text-white"
          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
      }`}
      style={FONT}
    >
      {children}
    </button>
  );
}

function EmptyBlock({ total }: { total: number }) {
  return (
    <div className="py-16 text-center">
      <ArrowLeftRight className="h-8 w-8 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-400" style={FONT}>
        {total === 0 ? "No matches yet" : "No matches match your filters"}
      </p>
    </div>
  );
}
