"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  createUser,
  updateUser,
  deleteUser as deleteUserAction,
  type CreateUserInput,
  type UserRole,
} from "@/app/dashboard/admin/users/actions";

interface UserRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  city: string | null;
  phone: string | null;
  created_at: string;
  dogs: { id: string }[];
  caregiver_details: { id: string }[];
}

interface DogOption {
  id: string;
  name: string;
  owner: { full_name: string | null } | null;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Dog Owner" },
  { value: "caregiver", label: "Caregiver" },
];

const SERVICES = ["boarding", "daycare", "walking", "drop-in", "training"];
const SIZES = ["small", "medium", "large"];

const INPUT =
  "w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#5F7E9D] focus:ring-1 focus:ring-[#5F7E9D]/20 transition-all";
const LABEL = "block text-xs font-medium text-[#260900] mb-1.5";
const FONT = { fontFamily: "Inter, sans-serif" } as const;

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function roleBadgeClass(role: string) {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-700";
    case "owner":
      return "bg-blue-100 text-blue-700";
    case "caregiver":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function roleLabel(role: string) {
  return ROLES.find((r) => r.value === role)?.label ?? role;
}

interface Props {
  initialUsers: UserRow[];
  dogs: DogOption[];
}

export function AdminUsersPage({ initialUsers, dogs }: Props) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(10);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<{
    email: string;
    full_name: string;
    role: UserRole;
    skip_email_verification: boolean;
    city: string;
    phone: string;
    dog_ids: string[];
    showNewDog: boolean;
    new_dog: {
      name: string;
      breed: string;
      size: string;
      age: string;
      energy_level: number | null;
      city: string;
    };
    showCaregiverProfile: boolean;
    caregiver: {
      bio: string;
      experience_years: string;
      services: string[];
      accepts_sizes: string[];
      certifications: string;
      city: string;
      zip_code: string;
      availability: string;
    };
  }>({
    email: "",
    full_name: "",
    role: "owner",
    skip_email_verification: true,
    city: "",
    phone: "",
    dog_ids: [],
    showNewDog: false,
    new_dog: {
      name: "",
      breed: "",
      size: "",
      age: "",
      energy_level: null,
      city: "",
    },
    showCaregiverProfile: false,
    caregiver: {
      bio: "",
      experience_years: "",
      services: [],
      accepts_sizes: [],
      certifications: "",
      city: "",
      zip_code: "",
      availability: "",
    },
  });

  const [editForm, setEditForm] = useState({
    full_name: "",
    role: "owner" as UserRole,
    city: "",
    phone: "",
  });

  const hasActiveFilters = search !== "" || roleFilter !== null;

  const filtered = initialUsers.filter((u) => {
    if (search) {
      const q = search.toLowerCase();
      const matchName = u.full_name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }
    if (roleFilter && u.role !== roleFilter) return false;
    return true;
  });

  const visible = filtered.slice(0, showCount);
  const hasMore = filtered.length > showCount;

  const clearFilters = () => {
    setSearch("");
    setRoleFilter(null);
  };

  const resetCreateForm = () => {
    setCreateForm({
      email: "",
      full_name: "",
      role: "owner",
      skip_email_verification: true,
      city: "",
      phone: "",
      dog_ids: [],
      showNewDog: false,
      new_dog: {
        name: "",
        breed: "",
        size: "",
        age: "",
        energy_level: null,
        city: "",
      },
      showCaregiverProfile: false,
      caregiver: {
        bio: "",
        experience_years: "",
        services: [],
        accepts_sizes: [],
        certifications: "",
        city: "",
        zip_code: "",
        availability: "",
      },
    });
    setCreatedPassword(null);
    setError(null);
  };

  const openCreate = () => {
    resetCreateForm();
    setCreateOpen(true);
  };

  const openEdit = (u: UserRow) => {
    setEditingUser(u);
    setEditForm({
      full_name: u.full_name ?? "",
      role: u.role as UserRole,
      city: u.city ?? "",
      phone: u.phone ?? "",
    });
    setError(null);
  };

  const toggleArray = (
    field: "services" | "accepts_sizes",
    value: string
  ) => {
    setCreateForm((f) => {
      const arr = f.caregiver[field];
      const next = arr.includes(value)
        ? arr.filter((x) => x !== value)
        : [...arr, value];
      return {
        ...f,
        caregiver: { ...f.caregiver, [field]: next },
      };
    });
  };

  const handleCreate = async () => {
    if (!createForm.email.trim() || !createForm.full_name.trim()) {
      setError("Email and Full Name are required");
      return;
    }
    setIsSaving(true);
    setError(null);

    const input: CreateUserInput = {
      email: createForm.email.trim(),
      full_name: createForm.full_name.trim(),
      role: createForm.role,
      skip_email_verification: createForm.skip_email_verification,
      city: createForm.city.trim() || undefined,
      phone: createForm.phone.trim() || undefined,
    };

    if (createForm.role === "owner") {
      if (createForm.dog_ids.length) input.dog_ids = createForm.dog_ids;
      if (createForm.showNewDog && createForm.new_dog.name.trim()) {
        input.new_dog = {
          name: createForm.new_dog.name.trim(),
          breed: createForm.new_dog.breed.trim(),
          size: createForm.new_dog.size || undefined,
          age: createForm.new_dog.age
            ? parseInt(createForm.new_dog.age, 10)
            : null,
          energy_level: createForm.new_dog.energy_level,
          city: createForm.new_dog.city.trim(),
        };
      }
    }

    if (createForm.role === "caregiver" && createForm.showCaregiverProfile) {
      input.caregiver_profile = {
        bio: createForm.caregiver.bio.trim(),
        experience_years: createForm.caregiver.experience_years
          ? parseInt(createForm.caregiver.experience_years, 10)
          : null,
        services: createForm.caregiver.services,
        accepts_sizes: createForm.caregiver.accepts_sizes,
        certifications: createForm.caregiver.certifications.trim(),
        city: createForm.caregiver.city.trim(),
        zip_code: createForm.caregiver.zip_code.trim(),
        availability: createForm.caregiver.availability,
      };
    }

    const result = await createUser(input);
    setIsSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    if (result.password) setCreatedPassword(result.password);
    else {
      setCreateOpen(false);
      resetCreateForm();
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser || !editForm.full_name.trim()) {
      setError("Name is required");
      return;
    }
    setIsSaving(true);
    setError(null);
    const result = await updateUser(editingUser.id, {
      full_name: editForm.full_name.trim(),
      role: editForm.role,
      city: editForm.city.trim() || undefined,
      phone: editForm.phone.trim() || undefined,
    });
    setIsSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setEditingUser(null);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    setError(null);
    const result = await deleteUserAction(deletingUser.id);
    setIsDeleting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setDeletingUser(null);
  };

  const Empty = ({ total, label }: { total: number; label: string }) => (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      style={FONT}
    >
      <Users className="h-12 w-12 text-gray-300 mb-3" />
      <p className="text-sm text-gray-500">
        {total === 0
          ? `No ${label} yet`
          : `No ${label} match your filters`}
      </p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1
          className="text-xl font-semibold text-[#260900]"
          style={FONT}
        >
          Users
        </h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#F3B443] text-white rounded-xl hover:transition-colors"
          style={FONT}
        >
          <Plus className="h-4 w-4" />
          Create User
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#5F7E9D] focus:ring-1 focus:ring-[#5F7E9D]/20 transition-all"
            style={FONT}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", "admin", "owner", "caregiver"].map((r) => (
            <button
              key={r}
              onClick={() =>
                setRoleFilter(r === "All" ? null : r)
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                (r === "All" && roleFilter === null) ||
                (r !== "All" && roleFilter === r)
                  ? "bg-[#F3B443] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
              style={FONT}
            >
              {r === "All" ? "All" : roleLabel(r)}
            </button>
          ))}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-[#F3B443] hover:underline"
            style={FONT}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-sm" style={FONT}>
          <thead>
            <tr className="bg-[#260900] border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium text-[#fff]">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-[#fff]">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-[#fff]">
                Role
              </th>
              <th className="text-left px-4 py-3 font-medium text-[#fff]">
                City
              </th>
              <th className="text-left px-4 py-3 font-medium text-[#fff]">
                Joined
              </th>
              <th className="text-right px-4 py-3 font-medium text-[#fff]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => (
              <tr
                key={u.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
              >
                <td className="px-4 py-3 text-[#2F3E4E]">
                  {u.full_name ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{u.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass(u.role)}`}
                  >
                    {roleLabel(u.role)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.city ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">
                  {fmtDate(u.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(u)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingUser(u)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {visible.length > 0
          ? visible.map((u) => (
              <div
                key={u.id}
                className="bg-white rounded-2xl border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className="font-medium text-[#2F3E4E]"
                      style={FONT}
                    >
                      {u.full_name ?? "—"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {u.email ?? "—"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium ${roleBadgeClass(u.role)}`}
                  >
                    {roleLabel(u.role)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {u.city && (
                    <span className="px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600 rounded-full">
                      {u.city}
                    </span>
                  )}
                  <span className="px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-500 rounded-full">
                    Joined {fmtDate(u.created_at)}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEdit(u)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-[#F3B443] text-white border-[#F3B443] rounded-xl"
                    style={FONT}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingUser(u)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl"
                    style={FONT}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          : initialUsers.length === 0 && (
              <Empty total={0} label="users" />
            )}

        {visible.length === 0 && initialUsers.length > 0 && (
          <Empty total={initialUsers.length} label="users" />
        )}
      </div>

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

      {/* Create User Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[5vh] px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isSaving && !createdPassword && setCreateOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-base font-semibold text-[#260900]" style={FONT}>
                Create User
              </h2>
              <button
                onClick={() =>
                  !isSaving && !createdPassword && (setCreateOpen(false), resetCreateForm())
                }
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {createdPassword ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                    <p className="text-sm font-medium text-green-800" style={FONT}>
                      User created successfully.
                    </p>
                    <p className="text-sm text-green-700 mt-2" style={FONT}>
                      Temporary password (share securely):
                    </p>
                    <code className="block mt-2 p-3 bg-white rounded-lg text-sm font-mono break-all">
                      {createdPassword}
                    </code>
                  </div>
                  <button
                    onClick={() => (setCreateOpen(false), resetCreateForm())}
                    className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#5F7E9D] rounded-xl"
                    style={FONT}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600" style={FONT}>
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL} style={FONT}>Email *</label>
                      <input
                        type="email"
                        value={createForm.email}
                        onChange={(e) =>
                          setCreateForm((f) => ({ ...f, email: e.target.value }))
                        }
                        className={INPUT}
                        style={FONT}
                      />
                    </div>
                    <div>
                      <label className={LABEL} style={FONT}>Full Name *</label>
                      <input
                        type="text"
                        value={createForm.full_name}
                        onChange={(e) =>
                          setCreateForm((f) => ({ ...f, full_name: e.target.value }))
                        }
                        className={INPUT}
                        style={FONT}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL} style={FONT}>Role *</label>
                    <div className="flex gap-2">
                      {ROLES.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() =>
                            setCreateForm((f) => ({ ...f, role: r.value }))
                          }
                          className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
                            createForm.role === r.value
                              ? "bg-[#F3B443] text-white border-[#F3B443]"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                          }`}
                          style={FONT}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createForm.skip_email_verification}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          skip_email_verification: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600" style={FONT}>
                      Skip email verification (user can log in immediately)
                    </span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL} style={FONT}>City</label>
                      <input
                        type="text"
                        value={createForm.city}
                        onChange={(e) =>
                          setCreateForm((f) => ({ ...f, city: e.target.value }))
                        }
                        className={INPUT}
                        style={FONT}
                      />
                    </div>
                    <div>
                      <label className={LABEL} style={FONT}>Phone</label>
                      <input
                        type="text"
                        value={createForm.phone}
                        onChange={(e) =>
                          setCreateForm((f) => ({ ...f, phone: e.target.value }))
                        }
                        className={INPUT}
                        style={FONT}
                      />
                    </div>
                  </div>

                  {createForm.role === "owner" && (
                    <>
                      <div className="border-t border-gray-100 pt-5">
                        <h3 className="text-sm font-medium text-[#260900] mb-3" style={FONT}>
                          Assign Dogs
                        </h3>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {dogs.map((d) => (
                            <label
                              key={d.id}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={createForm.dog_ids.includes(d.id)}
                                onChange={(e) =>
                                  setCreateForm((f) => ({
                                    ...f,
                                    dog_ids: e.target.checked
                                      ? [...f.dog_ids, d.id]
                                      : f.dog_ids.filter((id) => id !== d.id),
                                  }))
                                }
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm" style={FONT}>
                                {d.name}
                                {d.owner?.full_name && (
                                  <span className="text-gray-500">
                                    {" "}({d.owner.full_name})
                                  </span>
                                )}
                              </span>
                            </label>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCreateForm((f) => ({
                              ...f,
                              showNewDog: !f.showNewDog,
                            }))
                          }
                          className="mt-2 text-sm font-medium text-[#F3B443] hover:underline"
                          style={FONT}
                        >
                          + Create Dog
                        </button>
                        {createForm.showNewDog && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3">
                            <input
                              type="text"
                              placeholder="Dog name *"
                              value={createForm.new_dog.name}
                              onChange={(e) =>
                                setCreateForm((f) => ({
                                  ...f,
                                  new_dog: { ...f.new_dog, name: e.target.value },
                                }))
                              }
                              className={INPUT}
                              style={FONT}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Breed"
                                value={createForm.new_dog.breed}
                                onChange={(e) =>
                                  setCreateForm((f) => ({
                                    ...f,
                                    new_dog: { ...f.new_dog, breed: e.target.value },
                                  }))
                                }
                                className={INPUT}
                                style={FONT}
                              />
                              <select
                                value={createForm.new_dog.size}
                                onChange={(e) =>
                                  setCreateForm((f) => ({
                                    ...f,
                                    new_dog: { ...f.new_dog, size: e.target.value },
                                  }))
                                }
                                className={INPUT}
                                style={FONT}
                              >
                                <option value="">Size</option>
                                {SIZES.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                min={0}
                                placeholder="Age"
                                value={createForm.new_dog.age}
                                onChange={(e) =>
                                  setCreateForm((f) => ({
                                    ...f,
                                    new_dog: { ...f.new_dog, age: e.target.value },
                                  }))
                                }
                                className={INPUT}
                                style={FONT}
                              />
                              <div>
                                <label className={LABEL} style={FONT}>Energy</label>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                      key={n}
                                      type="button"
                                      onClick={() =>
                                        setCreateForm((f) => ({
                                          ...f,
                                          new_dog: {
                                            ...f.new_dog,
                                            energy_level: f.new_dog.energy_level === n ? null : n,
                                          },
                                        }))
                                      }
                                      className={`w-8 h-8 rounded-lg text-xs font-medium ${
                                        createForm.new_dog.energy_level === n
                                          ? "bg-[#5F7E9D] text-white"
                                          : "bg-white border border-gray-200"
                                      }`}
                                    >
                                      {n}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <input
                              type="text"
                              placeholder="City"
                              value={createForm.new_dog.city}
                              onChange={(e) =>
                                setCreateForm((f) => ({
                                  ...f,
                                  new_dog: { ...f.new_dog, city: e.target.value },
                                }))
                              }
                              className={INPUT}
                              style={FONT}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {createForm.role === "caregiver" && (
                    <div className="border-t border-gray-100 pt-5">
                      <label className="flex items-center gap-2 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={createForm.showCaregiverProfile}
                          onChange={(e) =>
                            setCreateForm((f) => ({
                              ...f,
                              showCaregiverProfile: e.target.checked,
                            }))
                          }
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium" style={FONT}>
                          Set up caregiver profile now
                        </span>
                      </label>
                      {createForm.showCaregiverProfile && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                          <div>
                            <label className={LABEL} style={FONT}>Bio</label>
                            <textarea
                              value={createForm.caregiver.bio}
                              onChange={(e) =>
                                setCreateForm((f) => ({
                                  ...f,
                                  caregiver: { ...f.caregiver, bio: e.target.value },
                                }))
                              }
                              rows={2}
                              className={`${INPUT} resize-none`}
                              style={FONT}
                            />
                          </div>
                          <div>
                            <label className={LABEL} style={FONT}>Experience (years)</label>
                            <input
                              type="number"
                              min={0}
                              value={createForm.caregiver.experience_years}
                              onChange={(e) =>
                                setCreateForm((f) => ({
                                  ...f,
                                  caregiver: {
                                    ...f.caregiver,
                                    experience_years: e.target.value,
                                  },
                                }))
                              }
                              className={INPUT}
                              style={FONT}
                            />
                          </div>
                          <div>
                            <label className={LABEL} style={FONT}>Services</label>
                            <div className="flex flex-wrap gap-1.5">
                              {SERVICES.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => toggleArray("services", s)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                                    createForm.caregiver.services.includes(s)
                                      ? "bg-[#5F7E9D]/10 text-[#5F7E9D] ring-1 ring-[#5F7E9D]/30"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                  style={FONT}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className={LABEL} style={FONT}>Accepted Sizes</label>
                            <div className="flex gap-2">
                              {SIZES.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => toggleArray("accepts_sizes", s)}
                                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl border ${
                                    createForm.caregiver.accepts_sizes.includes(s)
                                      ? "bg-[#5F7E9D] text-white border-[#5F7E9D]"
                                      : "bg-white border-gray-200"
                                  }`}
                                  style={FONT}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className={LABEL} style={FONT}>City</label>
                              <input
                                type="text"
                                value={createForm.caregiver.city}
                                onChange={(e) =>
                                  setCreateForm((f) => ({
                                    ...f,
                                    caregiver: { ...f.caregiver, city: e.target.value },
                                  }))
                                }
                                className={INPUT}
                                style={FONT}
                              />
                            </div>
                            <div>
                              <label className={LABEL} style={FONT}>Zip</label>
                              <input
                                type="text"
                                value={createForm.caregiver.zip_code}
                                onChange={(e) =>
                                  setCreateForm((f) => ({
                                    ...f,
                                    caregiver: { ...f.caregiver, zip_code: e.target.value },
                                  }))
                                }
                                className={INPUT}
                                style={FONT}
                              />
                            </div>
                          </div>
                          <div>
                            <label className={LABEL} style={FONT}>Availability</label>
                            <div className="flex gap-2">
                              {["weekdays", "weekends", "anytime"].map((a) => (
                                <button
                                  key={a}
                                  type="button"
                                  onClick={() =>
                                    setCreateForm((f) => ({
                                      ...f,
                                      caregiver: {
                                        ...f.caregiver,
                                        availability:
                                          f.caregiver.availability === a ? "" : a,
                                      },
                                    }))
                                  }
                                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl border ${
                                    createForm.caregiver.availability === a
                                      ? "bg-[#5F7E9D] text-white border-[#5F7E9D]"
                                      : "bg-white border-gray-200"
                                  }`}
                                  style={FONT}
                                >
                                  {a}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className={LABEL} style={FONT}>Certifications</label>
                            <input
                              type="text"
                              value={createForm.caregiver.certifications}
                              onChange={(e) =>
                                setCreateForm((f) => ({
                                  ...f,
                                  caregiver: {
                                    ...f.caregiver,
                                    certifications: e.target.value,
                                  },
                                }))
                              }
                              className={INPUT}
                              style={FONT}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {!createdPassword && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
                <button
                  onClick={() => (setCreateOpen(false), resetCreateForm())}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium  text-[#F3B443] bg-white border-2 border-[#F3B443] rounded-xl hover:transition-colors disabled:opacity-50"
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
                    "Create User"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isSaving && setEditingUser(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#260900]" style={FONT}>
                Edit User
              </h2>
              <button
                onClick={() => !isSaving && setEditingUser(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600" style={FONT}>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <p className="text-sm text-[#260900]">{editingUser.email}</p>
              <div>
                <label className={LABEL} style={FONT}>Full Name *</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                  className={INPUT}
                  style={FONT}
                />
              </div>
              <div>
                <label className={LABEL} style={FONT}>Role</label>
                <div className="flex gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() =>
                        setEditForm((f) => ({ ...f, role: r.value }))
                      }
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl border ${
                        editForm.role === r.value
                          ? "bg-[#F3B443] text-white border-[#F3B443]"
                          : "bg-white text-gray-600 border-gray-200"
                      }`}
                      style={FONT}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={LABEL} style={FONT}>City</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, city: e.target.value }))
                  }
                  className={INPUT}
                  style={FONT}
                />
              </div>
              <div>
                <label className={LABEL} style={FONT}>Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className={INPUT}
                  style={FONT}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setEditingUser(null)}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-[#F3B443] bg-white border-2 border-[#F3B443] rounded-xl hover:transition-colors disabled:opacity-50"
                style={FONT}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-5 py-2 text-sm font-medium text-white bg-[#F3B443] border-2 border-[#F3B443]  rounded-xl hover:bg-[#4e6d8c] transition-colors disabled:opacity-50 flex items-center gap-2"
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

      {/* Delete Confirmation */}
      {deletingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isDeleting && setDeletingUser(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-semibold text-[#2F3E4E] mb-2" style={FONT}>
              Delete User
            </h3>
            <p className="text-sm text-gray-500 mb-1" style={FONT}>
              Are you sure you want to delete{" "}
              <span className="font-medium text-[#2F3E4E]">
                {deletingUser.full_name ?? deletingUser.email ?? "this user"}
              </span>
              ?
            </p>
            <p className="text-xs text-gray-400 mb-5" style={FONT}>
              This will permanently delete their auth account, profile, dogs,
              caregiver record, and all matches.
            </p>
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600" style={FONT}>
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingUser(null)}
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
