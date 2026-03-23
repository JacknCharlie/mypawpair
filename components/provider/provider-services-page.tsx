"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, AlertCircle } from "lucide-react";
import {
  createService,
  updateService,
  deleteService,
} from "@/app/dashboard/provider/services/actions";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_type: string | null;
  duration_minutes: number | null;
  is_active: boolean;
}

const PRICE_TYPES = [
  { value: "fixed", label: "Fixed price" },
  { value: "from", label: "From (starting at)" },
  { value: "free", label: "Free" },
  { value: "contact", label: "Contact for price" },
];

const FONT = { fontFamily: "Inter, sans-serif" } as const;
const INPUT =
  "w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#5F7E9D] focus:ring-1 focus:ring-[#5F7E9D]/20";
const LABEL = "block text-xs font-medium text-gray-600 mb-1.5";

interface Props {
  providerId: string;
  initialServices: Service[];
}

export function ProviderServicesPage({ providerId, initialServices }: Props) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    price_type: "contact" as "fixed" | "from" | "free" | "contact",
    duration_minutes: "",
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      price: "",
      price_type: "contact",
      duration_minutes: "",
    });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      name: s.name,
      description: s.description ?? "",
      price: s.price?.toString() ?? "",
      price_type: (s.price_type as "fixed" | "from" | "free" | "contact") ?? "contact",
      duration_minutes: s.duration_minutes?.toString() ?? "",
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Service name is required");
      return;
    }
    setIsSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: form.price ? parseFloat(form.price) : undefined,
      price_type: form.price_type,
      duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : undefined,
    };

    const result = editing
      ? await updateService(editing.id, providerId, payload)
      : await createService(providerId, payload);

    setIsSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setModalOpen(false);
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    setError(null);
    const result = await deleteService(deleting.id, providerId);
    setIsDeleting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setDeleting(null);
    setServices((prev) => prev.filter((s) => s.id !== deleting.id));
    window.location.reload();
  };

  const formatPrice = (s: Service) => {
    if (s.price_type === "free") return "Free";
    if (s.price_type === "contact") return "Contact for price";
    if (s.price !== null)
      return s.price_type === "from" ? `From $${s.price}` : `$${s.price}`;
    return "—";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#2F3E4E]" style={FONT}>
          My Services
        </h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5F7E9D] text-white text-sm font-medium rounded-xl hover:bg-[#4e6d8c] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-4" style={FONT}>
            No services yet. Add your first service to get discovered by dog owners.
          </p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5F7E9D] text-white rounded-xl hover:bg-[#4e6d8c]"
          >
            <Plus className="h-4 w-4" />
            Add service
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-[#2F3E4E]" style={FONT}>
                  {s.name}
                </p>
                <p className="text-sm text-gray-500" style={FONT}>
                  {formatPrice(s)}
                  {s.duration_minutes && ` • ${s.duration_minutes} min`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(s)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#5F7E9D]"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setDeleting(s);
                    setError(null);
                  }}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#2F3E4E]" style={FONT}>
                {editing ? "Edit service" : "Add service"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={LABEL} style={FONT}>Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={INPUT}
                  placeholder="e.g. Basic Groom"
                />
              </div>
              <div>
                <label className={LABEL} style={FONT}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={INPUT}
                  rows={2}
                  placeholder="Brief description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL} style={FONT}>Price type</label>
                  <select
                    value={form.price_type}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        price_type: e.target.value as "fixed" | "from" | "free" | "contact",
                      }))
                    }
                    className={INPUT}
                  >
                    {PRICE_TYPES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                {(form.price_type === "fixed" || form.price_type === "from") && (
                  <div>
                    <label className={LABEL} style={FONT}>Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      className={INPUT}
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className={LABEL} style={FONT}>Duration (minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={form.duration_minutes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration_minutes: e.target.value }))
                  }
                  className={INPUT}
                  placeholder="e.g. 60"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-2.5 bg-[#5F7E9D] text-white rounded-xl font-medium hover:bg-[#4e6d8c] disabled:opacity-60"
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-[#2F3E4E] mb-2" style={FONT}>
              Delete service?
            </h3>
            <p className="text-sm text-gray-500 mb-4" style={FONT}>
              Are you sure you want to delete &quot;{deleting.name}&quot;?
            </p>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-600 mb-4">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-60"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
