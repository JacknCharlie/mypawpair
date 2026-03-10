"use client";

import { useState } from "react";
import {
  Search,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Heart,
} from "lucide-react";
import {
  updateCaregiver,
  toggleApproval,
  deleteCaregiver as deleteCaregiverAction,
} from "@/app/dashboard/admin/caregivers/actions";

interface CaregiverData {
  id: string;
  bio: string | null;
  experience_years: number | null;
  accepts_sizes: string[] | null;
  accepts_temperaments: string[] | null;
  services: string[] | null;
  certifications: string | null;
  city: string | null;
  zip_code: string | null;
  availability: string | null;
  is_approved: boolean;
  created_at: string;
}

interface CaregiverRow {
  id: string;
  full_name: string | null;
  city: string | null;
  phone: string | null;
  created_at: string;
  caregiver_details: CaregiverData[];
}

interface CaregiverForm {
  full_name: string;
  phone: string;
  bio: string;
  experience_years: string;
  services: string[];
  accepts_sizes: string[];
  certifications: string;
  city: string;
  zip_code: string;
  availability: string;
}

const EMPTY_FORM: CaregiverForm = {
  full_name: "",
  phone: "",
  bio: "",
  experience_years: "",
  services: [],
  accepts_sizes: [],
  certifications: "",
  city: "",
  zip_code: "",
  availability: "",
};

const SERVICES = ["boarding", "daycare", "walking", "drop-in", "training"];
const SIZES = ["small", "medium", "large"];

const INPUT =
  "w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#5F7E9D] focus:ring-1 focus:ring-[#5F7E9D]/20 transition-all";
const LABEL = "block text-xs font-medium text-gray-600 mb-1.5";
const FONT = { fontFamily: "Inter, sans-serif" } as const;

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface Props {
  initialCaregivers: CaregiverRow[];
}

export function AdminCaregiversPage({ initialCaregivers }: Props) {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [approvedFilter, setApprovedFilter] = useState<boolean | null>(null);
  const [showCount, setShowCount] = useState(10);

  const [editingRow, setEditingRow] = useState<CaregiverRow | null>(null);
  const [deletingRow, setDeletingRow] = useState<CaregiverRow | null>(null);
  const [form, setForm] = useState<CaregiverForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cities = [
    ...new Set(
      initialCaregivers
        .map((c) => c.caregiver_details[0]?.city ?? c.city)
        .filter(Boolean)
    ),
  ] as string[];

  const hasActiveFilters =
    search !== "" || cityFilter !== null || approvedFilter !== null;

  const filtered = initialCaregivers.filter((row) => {
    if (search) {
      const q = search.toLowerCase();
      if (!row.full_name?.toLowerCase().includes(q)) return false;
    }
    const cg = row.caregiver_details[0];
    const cgCity = cg?.city ?? row.city;
    if (cityFilter && cgCity !== cityFilter) return false;
    if (approvedFilter !== null && cg?.is_approved !== approvedFilter)
      return false;
    return true;
  });

  const visible = filtered.slice(0, showCount);
  const hasMore = filtered.length > showCount;

  const clearFilters = () => {
    setSearch("");
    setCityFilter(null);
    setApprovedFilter(null);
  };

  const openEdit = (row: CaregiverRow) => {
    const cg = row.caregiver_details[0];
    setEditingRow(row);
    setForm({
      full_name: row.full_name ?? "",
      phone: row.phone ?? "",
      bio: cg?.bio ?? "",
      experience_years:
        cg?.experience_years != null ? String(cg.experience_years) : "",
      services: cg?.services ?? [],
      accepts_sizes: cg?.accepts_sizes ?? [],
      certifications: cg?.certifications ?? "",
      city: cg?.city ?? row.city ?? "",
      zip_code: cg?.zip_code ?? "",
      availability: cg?.availability ?? "",
    });
    setError(null);
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      setError("Name is required");
      return;
    }
    setIsSaving(true);
    setError(null);

    const cg = editingRow!.caregiver_details[0];
    const result = await updateCaregiver(
      editingRow!.id,
      cg?.id ?? null,
      {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
      },
      {
        bio: form.bio.trim(),
        experience_years: form.experience_years
          ? parseInt(form.experience_years, 10)
          : null,
        services: form.services,
        accepts_sizes: form.accepts_sizes,
        certifications: form.certifications.trim(),
        city: form.city.trim(),
        zip_code: form.zip_code.trim(),
        availability: form.availability,
      }
    );

    setIsSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setEditingRow(null);
  };

  const handleToggle = async (cgId: string, approved: boolean) => {
    setTogglingId(cgId);
    await toggleApproval(cgId, approved);
    setTogglingId(null);
  };

  const handleDelete = async () => {
    if (!deletingRow) return;
    setIsDeleting(true);
    setError(null);
    const result = await deleteCaregiverAction(deletingRow.id);
    setIsDeleting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setDeletingRow(null);
  };

  const toggleArray = (field: "services" | "accepts_sizes", value: string) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }));
  };

  return (
    <div className="space-y-5">
      {/* ── Search ── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#5F7E9D] focus:ring-1 focus:ring-[#5F7E9D]/20 transition-all"
          style={FONT}
        />
      </div>

      {/* ── Filter Cards ── */}
      <div className="grid grid-cols-2 gap-3">
        <FilterCard label="City">
          <select
            value={cityFilter ?? ""}
            onChange={(e) => setCityFilter(e.target.value || null)}
            className="w-full px-2.5 py-1.5 text-[11px] font-medium bg-gray-50 border-0 rounded-lg text-gray-600 outline-none focus:ring-1 focus:ring-[#5F7E9D]/30 cursor-pointer"
            style={FONT}
          >
            <option value="">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FilterCard>

        <FilterCard label="Status">
          {([null, true, false] as const).map((v, i) => (
            <Pill
              key={i}
              active={approvedFilter === v}
              onClick={() => setApprovedFilter(v)}
            >
              {v === null ? "All" : v ? "Approved" : "Pending"}
            </Pill>
          ))}
        </FilterCard>
      </div>

      {/* ── Count ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500" style={FONT}>
          {filtered.length === initialCaregivers.length
            ? `${initialCaregivers.length} ${initialCaregivers.length === 1 ? "caregiver" : "caregivers"}`
            : `${filtered.length} of ${initialCaregivers.length} caregivers`}
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
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {[
                    "Name",
                    "City",
                    "Services",
                    "Experience",
                    "Availability",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
                      style={FONT}
                    >
                      {h}
                    </th>
                  ))}
                  <th
                    className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
                    style={FONT}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const cg = row.caregiver_details[0];
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span
                          className="text-sm font-medium text-[#2F3E4E]"
                          style={FONT}
                        >
                          {row.full_name ?? "—"}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-sm text-gray-600"
                        style={FONT}
                      >
                        {cg?.city ?? row.city ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {cg?.services?.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-50 text-purple-600 rounded-full"
                              style={FONT}
                            >
                              {s}
                            </span>
                          ))}
                          {(cg?.services?.length ?? 0) > 3 && (
                            <span
                              className="text-[10px] text-gray-400"
                              style={FONT}
                            >
                              +{(cg?.services?.length ?? 0) - 3}
                            </span>
                          )}
                          {!cg?.services?.length && (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 text-sm text-gray-600"
                        style={FONT}
                      >
                        {cg?.experience_years != null
                          ? `${cg.experience_years}y`
                          : "—"}
                      </td>
                      <td
                        className="px-4 py-3 text-sm text-gray-600 capitalize"
                        style={FONT}
                      >
                        {cg?.availability ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {cg ? (
                          <button
                            onClick={() =>
                              handleToggle(cg.id, !cg.is_approved)
                            }
                            disabled={togglingId === cg.id}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors disabled:opacity-50 ${
                              cg.is_approved
                                ? "bg-green-50 text-green-600 hover:bg-green-100"
                                : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                            }`}
                            style={FONT}
                          >
                            {cg.is_approved ? "Approved" : "Pending"}
                          </button>
                        ) : (
                          <span
                            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-400"
                            style={FONT}
                          >
                            No profile
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(row)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#5F7E9D] transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingRow(row);
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
          <EmptyBlock total={initialCaregivers.length} />
        )}
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden space-y-3">
        {visible.length > 0
          ? visible.map((row) => {
              const cg = row.caregiver_details[0];
              return (
                <div
                  key={row.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="min-w-0">
                      <h3
                        className="text-sm font-semibold text-[#2F3E4E] truncate"
                        style={FONT}
                      >
                        {row.full_name ?? "Unnamed"}
                      </h3>
                      <p
                        className="text-xs text-gray-500 truncate"
                        style={FONT}
                      >
                        {cg?.city ?? row.city ?? "No city"}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0 ml-3">
                      <button
                        onClick={() => openEdit(row)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#5F7E9D] transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingRow(row);
                          setError(null);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {cg ? (
                      <button
                        onClick={() =>
                          handleToggle(cg.id, !cg.is_approved)
                        }
                        disabled={togglingId === cg.id}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded-full transition-colors disabled:opacity-50 ${
                          cg.is_approved
                            ? "bg-green-50 text-green-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                        style={FONT}
                      >
                        {cg.is_approved ? "Approved" : "Pending"}
                      </button>
                    ) : (
                      <span
                        className="px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-400 rounded-full"
                        style={FONT}
                      >
                        No profile
                      </span>
                    )}
                    {cg?.experience_years != null && (
                      <span
                        className="px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600 rounded-full"
                        style={FONT}
                      >
                        {cg.experience_years}y exp
                      </span>
                    )}
                    {cg?.availability && (
                      <span
                        className="px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-600 rounded-full capitalize"
                        style={FONT}
                      >
                        {cg.availability}
                      </span>
                    )}
                  </div>

                  {cg?.services && cg.services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {cg.services.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-50 text-purple-600 rounded-full"
                          style={FONT}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <p
                    className="text-xs text-gray-400 mt-1"
                    style={FONT}
                  >
                    Joined {fmtDate(row.created_at)}
                  </p>
                </div>
              );
            })
          : initialCaregivers.length === 0 && (
              <EmptyBlock total={0} />
            )}

        {visible.length === 0 && initialCaregivers.length > 0 && (
          <EmptyBlock total={initialCaregivers.length} />
        )}
      </div>

      {/* ── View More ── */}
      {hasMore && (
        <div className="flex justify-center pt-1">
          <button
            onClick={() => setShowCount((c) => c + 10)}
            className="px-6 py-2.5 text-sm font-medium text-[#5F7E9D] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            style={FONT}
          >
            View More · {filtered.length - showCount} remaining
          </button>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingRow && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[5vh] px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isSaving && setEditingRow(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2
                className="text-base font-semibold text-[#2F3E4E]"
                style={FONT}
              >
                Edit Caregiver
              </h2>
              <button
                onClick={() => !isSaving && setEditingRow(null)}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL} style={FONT}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, full_name: e.target.value }))
                    }
                    className={INPUT}
                    style={FONT}
                  />
                </div>
                <div>
                  <label className={LABEL} style={FONT}>
                    Phone
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className={INPUT}
                    style={FONT}
                  />
                </div>
              </div>

              {editingRow.caregiver_details[0] ? (
                <>
                  <div>
                    <label className={LABEL} style={FONT}>
                      Bio
                    </label>
                    <textarea
                      value={form.bio}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, bio: e.target.value }))
                      }
                      rows={3}
                      className={`${INPUT} resize-none`}
                      style={FONT}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL} style={FONT}>
                        Experience (years)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={form.experience_years}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            experience_years: e.target.value,
                          }))
                        }
                        className={INPUT}
                        style={FONT}
                      />
                    </div>
                    <div>
                      <label className={LABEL} style={FONT}>
                        Certifications
                      </label>
                      <input
                        type="text"
                        value={form.certifications}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            certifications: e.target.value,
                          }))
                        }
                        className={INPUT}
                        style={FONT}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL} style={FONT}>
                      Services
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SERVICES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleArray("services", s)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            form.services.includes(s)
                              ? "bg-[#5F7E9D]/10 text-[#5F7E9D] ring-1 ring-[#5F7E9D]/30"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                          style={FONT}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={LABEL} style={FONT}>
                      Accepted Sizes
                    </label>
                    <div className="flex gap-2">
                      {SIZES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleArray("accepts_sizes", s)}
                          className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
                            form.accepts_sizes.includes(s)
                              ? "bg-[#5F7E9D] text-white border-[#5F7E9D]"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                          }`}
                          style={FONT}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={LABEL} style={FONT}>
                      Availability
                    </label>
                    <div className="flex gap-2">
                      {["weekdays", "weekends", "anytime"].map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              availability: f.availability === a ? "" : a,
                            }))
                          }
                          className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
                            form.availability === a
                              ? "bg-[#5F7E9D] text-white border-[#5F7E9D]"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                          }`}
                          style={FONT}
                        >
                          {a.charAt(0).toUpperCase() + a.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL} style={FONT}>
                        City
                      </label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, city: e.target.value }))
                        }
                        className={INPUT}
                        style={FONT}
                      />
                    </div>
                    <div>
                      <label className={LABEL} style={FONT}>
                        Zip Code
                      </label>
                      <input
                        type="text"
                        value={form.zip_code}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, zip_code: e.target.value }))
                        }
                        className={INPUT}
                        style={FONT}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div
                  className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700"
                  style={FONT}
                >
                  This caregiver hasn&apos;t completed onboarding yet. Only
                  profile fields can be edited.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setEditingRow(null)}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                style={FONT}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 text-sm font-medium text-white bg-[#5F7E9D] rounded-xl hover:bg-[#4e6d8c] transition-colors disabled:opacity-50 flex items-center gap-2"
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
      {deletingRow && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isDeleting && setDeletingRow(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3
              className="text-base font-semibold text-[#2F3E4E] mb-2"
              style={FONT}
            >
              Delete Caregiver
            </h3>
            <p className="text-sm text-gray-500 mb-1" style={FONT}>
              Are you sure you want to delete{" "}
              <span className="font-medium text-[#2F3E4E]">
                {deletingRow.full_name ?? "this caregiver"}
              </span>
              ?
            </p>
            <p className="text-xs text-gray-400 mb-5" style={FONT}>
              This will remove their profile, caregiver record, and all
              associated matches. The auth account will remain in Supabase.
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
                onClick={() => setDeletingRow(null)}
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
        className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
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
          ? "bg-[#5F7E9D] text-white"
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
      <Heart className="h-8 w-8 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-400" style={FONT}>
        {total === 0
          ? "No caregivers yet"
          : "No caregivers match your filters"}
      </p>
    </div>
  );
}
