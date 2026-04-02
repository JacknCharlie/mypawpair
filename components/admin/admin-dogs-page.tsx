"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  PawPrint,
  Zap,
} from "lucide-react";
import {
  createDog,
  updateDog,
  deleteDog as deleteDogAction,
  generateMatchesForDog,
} from "@/app/dashboard/admin/dogs/actions";

interface Dog {
  id: string;
  owner_id: string;
  name: string;
  breed: string | null;
  size: string | null;
  age: number | null;
  energy_level: number | null;
  temperament: string[] | null;
  special_needs: boolean;
  special_notes: string | null;
  city: string | null;
  zip_code: string | null;
  care_type: string[] | null;
  availability: string | null;
  created_at: string;
  owner: { full_name: string | null } | null;
}

interface Owner {
  id: string;
  full_name: string | null;
}

interface DogForm {
  name: string;
  breed: string;
  owner_id: string;
  size: string;
  age: string;
  energy_level: number | null;
  temperament: string[];
  special_needs: boolean;
  special_notes: string;
  city: string;
  zip_code: string;
  care_type: string[];
  availability: string;
}

const EMPTY_FORM: DogForm = {
  name: "",
  breed: "",
  owner_id: "",
  size: "",
  age: "",
  energy_level: null,
  temperament: [],
  special_needs: false,
  special_notes: "",
  city: "",
  zip_code: "",
  care_type: [],
  availability: "",
};

const TEMPERAMENTS = [
  "friendly",
  "playful",
  "social",
  "curious",
  "gentle",
  "anxious",
  "protective",
  "energetic",
  "loyal",
  "calm",
  "intelligent",
  "affectionate",
  "mouthy",
];

const CARE_TYPES = ["boarding", "daycare", "walking", "drop-in", "training"];

const SIZE_CHIP: Record<string, string> = {
  small: "bg-blue-50 text-blue-600",
  medium: "bg-amber-50 text-amber-600",
  large: "bg-green-50 text-green-600",
};

const INPUT =
  "w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#5F7E9D] focus:ring-1 focus:ring-[#5F7E9D]/20 transition-all";
const LABEL = "block text-xs font-medium text-[#260900] mb-1.5";
const FONT = { fontFamily: "Inter, sans-serif" } as const;

interface Props {
  initialDogs: Dog[];
  owners: Owner[];
}

export function AdminDogsPage({ initialDogs, owners }: Props) {
  const [search, setSearch] = useState("");
  const [sizeFilter, setSizeFilter] = useState<string | null>(null);
  const [energyFilter, setEnergyFilter] = useState<number | null>(null);
  const [needsFilter, setNeedsFilter] = useState<boolean | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(10);

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [deletingDog, setDeletingDog] = useState<Dog | null>(null);
  const [generatingDogId, setGeneratingDogId] = useState<string | null>(null);
  const [form, setForm] = useState<DogForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cities = [
    ...new Set(initialDogs.map((d) => d.city).filter(Boolean)),
  ] as string[];

  const hasActiveFilters =
    search !== "" ||
    sizeFilter !== null ||
    energyFilter !== null ||
    needsFilter !== null ||
    cityFilter !== null;

  const filteredDogs = initialDogs.filter((dog) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !dog.name.toLowerCase().includes(q) &&
        !dog.breed?.toLowerCase().includes(q)
      )
        return false;
    }
    if (sizeFilter && dog.size !== sizeFilter) return false;
    if (energyFilter !== null && dog.energy_level !== energyFilter) return false;
    if (needsFilter !== null && dog.special_needs !== needsFilter) return false;
    if (cityFilter && dog.city !== cityFilter) return false;
    return true;
  });

  const visibleDogs = filteredDogs.slice(0, showCount);
  const hasMore = filteredDogs.length > showCount;

  const clearFilters = () => {
    setSearch("");
    setSizeFilter(null);
    setEnergyFilter(null);
    setNeedsFilter(null);
    setCityFilter(null);
  };

  const openAddModal = () => {
    setModalMode("add");
    setEditingDog(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  const openEditModal = (dog: Dog) => {
    setModalMode("edit");
    setEditingDog(dog);
    setForm({
      name: dog.name,
      breed: dog.breed ?? "",
      owner_id: dog.owner_id,
      size: dog.size ?? "",
      age: dog.age != null ? String(dog.age) : "",
      energy_level: dog.energy_level,
      temperament: dog.temperament ?? [],
      special_needs: dog.special_needs,
      special_notes: dog.special_notes ?? "",
      city: dog.city ?? "",
      zip_code: dog.zip_code ?? "",
      care_type: dog.care_type ?? [],
      availability: dog.availability ?? "",
    });
    setError(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Dog name is required");
      return;
    }
    if (!form.owner_id) {
      setError("Please select an owner");
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      owner_id: form.owner_id,
      breed: form.breed.trim(),
      size: form.size,
      age: form.age ? parseInt(form.age, 10) : null,
      energy_level: form.energy_level,
      temperament: form.temperament,
      special_needs: form.special_needs,
      special_notes: form.special_notes.trim(),
      city: form.city.trim(),
      zip_code: form.zip_code.trim(),
      care_type: form.care_type,
      availability: form.availability,
    };

    const result =
      modalMode === "add"
        ? await createDog(payload)
        : await updateDog(editingDog!.id, payload);

    setIsSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setModalMode(null);
  };

  const handleDelete = async () => {
    if (!deletingDog) return;
    setIsDeleting(true);
    setError(null);
    const result = await deleteDogAction(deletingDog.id);
    setIsDeleting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setDeletingDog(null);
  };

  const handleGenerateMatches = async (dogId: string) => {
    setGeneratingDogId(dogId);
    const result = await generateMatchesForDog(dogId);
    setGeneratingDogId(null);
    if (result.success) {
      alert(`Generated ${result.count} matches.`);
    } else {
      setError(result.error ?? "Failed to generate matches");
    }
  };

  const toggleArray = (field: "temperament" | "care_type", value: string) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }));
  };

  return (
    <div className="space-y-5">
      {/* ── Header: Search + Add ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or breed…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#5F7E9D] focus:ring-1 focus:ring-[#5F7E9D]/20 transition-all"
            style={FONT}
          />
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F3B443] text-white text-sm font-medium rounded-xl hover:bg-[#d6a028] transition-colors shrink-0"
          style={FONT}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Dog</span>
        </button>
      </div>

      {/* ── Filter Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <FilterCard label="Size">
          {[null, "small", "medium", "large"].map((s) => (
            <Pill
              key={s ?? "all"}
              active={sizeFilter === s}
              onClick={() => setSizeFilter(s)}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            </Pill>
          ))}
        </FilterCard>

        <FilterCard label="Energy">
          <Pill
            active={energyFilter === null}
            onClick={() => setEnergyFilter(null)}
          >
            All
          </Pill>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pill
              key={n}
              active={energyFilter === n}
              onClick={() => setEnergyFilter(n)}
            >
              {n}
            </Pill>
          ))}
        </FilterCard>

        <FilterCard label="Special Needs">
          {([null, true, false] as const).map((v, i) => (
            <Pill
              key={i}
              active={needsFilter === v}
              onClick={() => setNeedsFilter(v)}
            >
              {v === null ? "All" : v ? "Yes" : "No"}
            </Pill>
          ))}
        </FilterCard>

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
      </div>

      {/* ── Count + Clear ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500" style={FONT}>
          {filteredDogs.length === initialDogs.length
            ? `${initialDogs.length} ${initialDogs.length === 1 ? "dog" : "dogs"}`
            : `${filteredDogs.length} of ${initialDogs.length} dogs`}
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
        {visibleDogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {[
                    "Name",
                    "Breed",
                    "Size",
                    "Age",
                    "Energy",
                    "Owner",
                    "City",
                    "Needs",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[11px] font-semibold text-[#260900] uppercase tracking-wider"
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
                {visibleDogs.map((dog) => (
                  <tr
                    key={dog.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span
                        className="text-sm font-medium text-[#2F3E4E]"
                        style={FONT}
                      >
                        {dog.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600" style={FONT}>
                      {dog.breed ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {dog.size ? (
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full ${SIZE_CHIP[dog.size] ?? "bg-gray-100 text-gray-600"}`}
                          style={FONT}
                        >
                          {dog.size.charAt(0).toUpperCase() + dog.size.slice(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-600"
                      style={FONT}
                    >
                      {dog.age != null ? `${dog.age}y` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${i < (dog.energy_level ?? 0) ? "bg-[#5F7E9D]" : "bg-gray-200"}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-600"
                      style={FONT}
                    >
                      {dog.owner?.full_name ?? "Unknown"}
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-600"
                      style={FONT}
                    >
                      {dog.city ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {dog.special_needs ? (
                        <span
                          className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-full bg-red-50 text-red-500"
                          style={FONT}
                        >
                          Yes
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleGenerateMatches(dog.id)}
                          disabled={generatingDogId === dog.id}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors disabled:opacity-50"
                          title="Generate Matches"
                        >
                          {generatingDogId === dog.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                          ) : (
                            <Zap className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(dog)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#5F7E9D] transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingDog(dog);
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
          <EmptyState total={initialDogs.length} />
        )}
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden space-y-3">
        {visibleDogs.length > 0
          ? visibleDogs.map((dog) => (
              <div
                key={dog.id}
                className="bg-white rounded-2xl border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between mb-2.5">
                  <div className="min-w-0">
                    <h3
                      className="text-sm font-semibold text-[#2F3E4E] truncate"
                      style={FONT}
                    >
                      {dog.name}
                    </h3>
                    <p
                      className="text-xs text-gray-500 truncate"
                      style={FONT}
                    >
                      {dog.breed ?? "No breed"}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 ml-3">
                    <button
                      onClick={() => handleGenerateMatches(dog.id)}
                      disabled={generatingDogId === dog.id}
                      className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors disabled:opacity-50"
                      title="Generate Matches"
                    >
                      {generatingDogId === dog.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                      ) : (
                        <Zap className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(dog)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#5F7E9D] transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingDog(dog);
                        setError(null);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {dog.size && (
                    <span
                      className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${SIZE_CHIP[dog.size]}`}
                      style={FONT}
                    >
                      {dog.size.charAt(0).toUpperCase() + dog.size.slice(1)}
                    </span>
                  )}
                  {dog.age != null && (
                    <span
                      className="px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600 rounded-full"
                      style={FONT}
                    >
                      {dog.age}y old
                    </span>
                  )}
                  {dog.energy_level != null && (
                    <span
                      className="px-2 py-0.5 text-[11px] font-medium bg-purple-50 text-purple-600 rounded-full"
                      style={FONT}
                    >
                      Energy {dog.energy_level}/5
                    </span>
                  )}
                  {dog.special_needs && (
                    <span
                      className="px-2 py-0.5 text-[11px] font-medium bg-red-50 text-red-500 rounded-full"
                      style={FONT}
                    >
                      Special Needs
                    </span>
                  )}
                </div>

                <div
                  className="flex items-center gap-2 text-xs text-gray-500"
                  style={FONT}
                >
                  <span className="truncate">
                    {dog.owner?.full_name ?? "Unknown"}
                  </span>
                  {dog.city && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="truncate">{dog.city}</span>
                    </>
                  )}
                </div>
              </div>
            ))
          : initialDogs.length > 0 && <EmptyState total={initialDogs.length} />}

        {initialDogs.length === 0 && <EmptyState total={0} />}
      </div>

      {/* ── View More ── */}
      {hasMore && (
        <div className="flex justify-center pt-1">
          <button
            onClick={() => setShowCount((c) => c + 10)}
            className="px-6 py-2.5 text-sm font-medium text-[#F3B443] bg-white border-2 border-[#F3B443] rounded-xl hover:bg-gray-50 transition-colors"
            style={FONT}
          >
            View More · {filteredDogs.length - showCount} remaining
          </button>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalMode && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[5vh] px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isSaving && setModalMode(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2
                className="text-base font-semibold text-[#260900]"
                style={FONT}
              >
                {modalMode === "add" ? "Add Dog" : "Edit Dog"}
              </h2>
              <button
                onClick={() => !isSaving && setModalMode(null)}
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
                    Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className={INPUT}
                    style={FONT}
                    placeholder="Dog name"
                  />
                </div>
                <div>
                  <label className={LABEL} style={FONT}>
                    Breed
                  </label>
                  <input
                    type="text"
                    value={form.breed}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, breed: e.target.value }))
                    }
                    className={INPUT}
                    style={FONT}
                    placeholder="e.g. Labrador Retriever"
                  />
                </div>
              </div>

              <div>
                <label className={LABEL} style={FONT}>
                  Owner *
                </label>
                <select
                  value={form.owner_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, owner_id: e.target.value }))
                  }
                  className={INPUT}
                  style={FONT}
                >
                  <option value="">Select an owner…</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.full_name ?? "Unnamed"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL} style={FONT}>
                    Size
                  </label>
                  <div className="flex gap-2">
                    {["small", "medium", "large"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            size: f.size === s ? "" : s,
                          }))
                        }
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
                          form.size === s
                            ? "bg-[#F3B443] text-white border-[#F3B443]"
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
                    Age
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.age}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, age: e.target.value }))
                    }
                    className={INPUT}
                    style={FONT}
                    placeholder="Years"
                  />
                </div>
              </div>

              <div>
                <label className={LABEL} style={FONT}>
                  Energy Level
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          energy_level: f.energy_level === n ? null : n,
                        }))
                      }
                      className={`w-10 h-10 rounded-xl text-sm font-medium border transition-colors ${
                        form.energy_level === n
                          ? "bg-[#F3B443] text-white border-[#F3B443]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                      style={FONT}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={LABEL} style={FONT}>
                  Temperament
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPERAMENTS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleArray("temperament", t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        form.temperament.includes(t)
                          ? "bg-[#5F7E9D]/10 text-[#5F7E9D] ring-1 ring-[#5F7E9D]/30"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                      style={FONT}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={LABEL} style={FONT}>
                  Care Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CARE_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleArray("care_type", t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        form.care_type.includes(t)
                          ? "bg-[#5F7E9D]/10 text-[#5F7E9D] ring-1 ring-[#5F7E9D]/30"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                      style={FONT}
                    >
                      {t}
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
                          ? "bg-[#F3B443] text-white border-[#F3B443]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                      style={FONT}
                    >
                      {a.charAt(0).toUpperCase() + a.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#260900]" style={FONT}>
                  Special Needs
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      special_needs: !f.special_needs,
                    }))
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.special_needs ? "bg-[#F3B443]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                      form.special_needs
                        ? "translate-x-[1.375rem]"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {form.special_needs && (
                <div>
                  <label className={LABEL} style={FONT}>
                    Special Notes
                  </label>
                  <textarea
                    value={form.special_notes}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        special_notes: e.target.value,
                      }))
                    }
                    rows={3}
                    className={`${INPUT} resize-none`}
                    style={FONT}
                    placeholder="Describe any special needs…"
                  />
                </div>
              )}

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
                    placeholder="City"
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
                    placeholder="Zip code"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setModalMode(null)}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium  text-[#F3B443] bg-white border-2 border-[#F3B443] rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
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
                ) : modalMode === "add" ? (
                  "Add Dog"
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deletingDog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isDeleting && setDeletingDog(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3
              className="text-base font-semibold text-[#2F3E4E] mb-2"
              style={FONT}
            >
              Delete Dog
            </h3>
            <p className="text-sm text-gray-500 mb-1" style={FONT}>
              Are you sure you want to delete{" "}
              <span className="font-medium text-[#2F3E4E]">
                {deletingDog.name}
              </span>
              ?
            </p>
            <p className="text-xs text-gray-400 mb-5" style={FONT}>
              This will also remove all matches for this dog. This action cannot
              be undone.
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
                onClick={() => setDeletingDog(null)}
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
          ? "bg-[#F3B443] text-white"
          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
      }`}
      style={FONT}
    >
      {children}
    </button>
  );
}

function EmptyState({ total }: { total: number }) {
  return (
    <div className="py-16 text-center">
      <PawPrint className="h-8 w-8 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-400" style={FONT}>
        {total === 0 ? "No dogs yet" : "No dogs match your filters"}
      </p>
    </div>
  );
}
