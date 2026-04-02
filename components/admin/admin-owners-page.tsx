"use client";

import { useState } from "react";
import {
  Search,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  updateOwner,
  deleteOwner as deleteOwnerAction,
} from "@/app/dashboard/admin/owners/actions";

interface OwnerRow {
  id: string;
  full_name: string | null;
  city: string | null;
  phone: string | null;
  created_at: string;
  dogs: { id: string }[];
}

interface OwnerForm {
  full_name: string;
  city: string;
  phone: string;
}

const EMPTY_FORM: OwnerForm = { full_name: "", city: "", phone: "" };

const INPUT =
  "w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#5F7E9D] focus:ring-1 focus:ring-[#260900]/20 transition-all";
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
  initialOwners: OwnerRow[];
}

export function AdminOwnersPage({ initialOwners }: Props) {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [dogsFilter, setDogsFilter] = useState<boolean | null>(null);
  const [showCount, setShowCount] = useState(10);

  const [editingOwner, setEditingOwner] = useState<OwnerRow | null>(null);
  const [deletingOwner, setDeletingOwner] = useState<OwnerRow | null>(null);
  const [form, setForm] = useState<OwnerForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cities = [
    ...new Set(initialOwners.map((o) => o.city).filter(Boolean)),
  ] as string[];

  const hasActiveFilters =
    search !== "" || cityFilter !== null || dogsFilter !== null;

  const filtered = initialOwners.filter((o) => {
    if (search) {
      const q = search.toLowerCase();
      if (!o.full_name?.toLowerCase().includes(q)) return false;
    }
    if (cityFilter && o.city !== cityFilter) return false;
    if (dogsFilter !== null) {
      const hasDogs = o.dogs.length > 0;
      if (dogsFilter !== hasDogs) return false;
    }
    return true;
  });

  const visible = filtered.slice(0, showCount);
  const hasMore = filtered.length > showCount;

  const clearFilters = () => {
    setSearch("");
    setCityFilter(null);
    setDogsFilter(null);
  };

  const openEdit = (owner: OwnerRow) => {
    setEditingOwner(owner);
    setForm({
      full_name: owner.full_name ?? "",
      city: owner.city ?? "",
      phone: owner.phone ?? "",
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

    const result = await updateOwner(editingOwner!.id, {
      full_name: form.full_name.trim(),
      city: form.city.trim(),
      phone: form.phone.trim(),
    });

    setIsSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setEditingOwner(null);
  };

  const handleDelete = async () => {
    if (!deletingOwner) return;
    setIsDeleting(true);
    setError(null);
    const result = await deleteOwnerAction(deletingOwner.id);
    setIsDeleting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setDeletingOwner(null);
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

        <FilterCard label="Dogs">
          {([null, true, false] as const).map((v, i) => (
            <Pill
              key={i}
              active={dogsFilter === v}
              onClick={() => setDogsFilter(v)}
            >
              {v === null ? "All" : v ? "Has Dogs" : "No Dogs"}
            </Pill>
          ))}
        </FilterCard>
      </div>

      {/* ── Count ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500" style={FONT}>
          {filtered.length === initialOwners.length
            ? `${initialOwners.length} ${initialOwners.length === 1 ? "owner" : "owners"}`
            : `${filtered.length} of ${initialOwners.length} owners`}
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
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-[#5F7E9D] border-b border-gray-100">
                  {["Name", "City", "Phone", "Dogs", "Joined"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider"
                      style={FONT}
                    >
                      {h}
                    </th>
                  ))}
                  <th
                    className="text-right px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider"
                    style={FONT}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span
                        className="text-sm font-medium text-[#2F3E4E]"
                        style={FONT}
                      >
                        {o.full_name ?? "—"}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-600"
                      style={FONT}
                    >
                      {o.city ?? "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-600"
                      style={FONT}
                    >
                      {o.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full ${
                          o.dogs.length > 0
                            ? "bg-blue-50 text-blue-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                        style={FONT}
                      >
                        {o.dogs.length}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-500"
                      style={FONT}
                    >
                      {fmtDate(o.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(o)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#5F7E9D] transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingOwner(o);
                            setError(null);
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty total={initialOwners.length} label="owners" />
        )}
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden space-y-3">
        {visible.length > 0
          ? visible.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-2xl border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between mb-2.5">
                  <div className="min-w-0">
                    <h3
                      className="text-sm font-semibold text-[#2F3E4E] truncate"
                      style={FONT}
                    >
                      {o.full_name ?? "Unnamed"}
                    </h3>
                    <p className="text-xs text-gray-500 truncate" style={FONT}>
                      {o.city ?? "No city"}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 ml-3">
                    <button
                      onClick={() => openEdit(o)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#5F7E9D] transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingOwner(o);
                        setError(null);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span
                    className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${
                      o.dogs.length > 0
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    style={FONT}
                  >
                    {o.dogs.length} {o.dogs.length === 1 ? "dog" : "dogs"}
                  </span>
                  {o.phone && (
                    <span
                      className="px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600 rounded-full"
                      style={FONT}
                    >
                      {o.phone}
                    </span>
                  )}
                  <span
                    className="px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-500 rounded-full"
                    style={FONT}
                  >
                    Joined {fmtDate(o.created_at)}
                  </span>
                </div>
              </div>
            ))
          : initialOwners.length === 0 && (
              <Empty total={0} label="owners" />
            )}

        {visible.length === 0 && initialOwners.length > 0 && (
          <Empty total={initialOwners.length} label="owners" />
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
      {editingOwner && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isSaving && setEditingOwner(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2
                className="text-base font-semibold text-[#2F3E4E]"
                style={FONT}
              >
                Edit Owner
              </h2>
              <button
                onClick={() => !isSaving && setEditingOwner(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
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

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setEditingOwner(null)}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-[#F3B443] bg-white border-2 border-[#F3B443] rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
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
      {deletingOwner && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isDeleting && setDeletingOwner(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3
              className="text-base font-semibold text-[#2F3E4E] mb-2"
              style={FONT}
            >
              Delete Owner
            </h3>
            <p className="text-sm text-gray-500 mb-1" style={FONT}>
              Are you sure you want to delete{" "}
              <span className="font-medium text-[#2F3E4E]">
                {deletingOwner.full_name ?? "this owner"}
              </span>
              ?
            </p>
            <p className="text-xs text-gray-400 mb-5" style={FONT}>
              This will also delete all their dogs and associated matches. The
              auth account will remain in Supabase.
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
                onClick={() => setDeletingOwner(null)}
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
      className={`px-2.5 py-1 rounded-lg text-[11px] text-[#260900] font-semibold transition-colors ${
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

function Empty({ total, label }: { total: number; label: string }) {
  return (
    <div className="py-16 text-center">
      <Users className="h-8 w-8 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-400" style={FONT}>
        {total === 0 ? `No ${label} yet` : `No ${label} match your filters`}
      </p>
    </div>
  );
}
