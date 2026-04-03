"use client";

import { useState } from "react";
import { Search, Mail, ClipboardList, AlertCircle } from "lucide-react";

interface WaitlistRow {
  id: string;
  email: string;
  created_at: string;
}

const FONT = { fontFamily: "Inter, sans-serif" } as const;

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface Props {
  initialWaitlist: WaitlistRow[];
}

export function AdminWaitlistPage({ initialWaitlist }: Props) {
  const [search, setSearch] = useState("");
  const [showCount, setShowCount] = useState(20);
  const [sending, setSending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());

  const filtered = initialWaitlist.filter((w) => {
    if (!search) return true;
    return w.email.toLowerCase().includes(search.toLowerCase());
  });

  const visible = filtered.slice(0, showCount);
  const hasMore = filtered.length > showCount;

  const handleSendInvite = async (email: string) => {
    setSending(email);
    setError(null);

    try {
      const res = await fetch("/api/waitlist/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to send invite");
      }

      setSent((prev) => new Set([...prev, email]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setSending(null);
    }
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
          placeholder="Search by email…"
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#5F7E9D] focus:ring-1 focus:ring-[#5F7E9D]/20 transition-all"
          style={FONT}
        />
      </div>

      {/* ── Count ── */}
      <div className="flex items-center justify-between">
        <p className="text-xstext-[#260900] font-medium" style={FONT}>
          {filtered.length === initialWaitlist.length
            ? `${initialWaitlist.length} ${initialWaitlist.length === 1 ? "person" : "people"} on waitlist`
            : `${filtered.length} of ${initialWaitlist.length} on waitlist`}
        </p>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600"
          style={FONT}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {visible.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-[#260900] border-b border-gray-100">
                  {["Email", "Joined", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider"
                      style={FONT}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((w) => (
                  <tr
                    key={w.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span
                        className="text-sm font-medium text-[#2F3E4E]"
                        style={FONT}
                      >
                        {w.email}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-500"
                      style={FONT}
                    >
                      {fmtDate(w.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleSendInvite(w.email)}
                        disabled={sending === w.email || sent.has(w.email)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-[#5F7E9D] rounded-xl hover:bg-[#4e6d8c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={FONT}
                      >
                        {sending === w.email ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending…
                          </>
                        ) : sent.has(w.email) ? (
                          <>
                            <Mail className="h-3.5 w-3.5" />
                            Invite sent
                          </>
                        ) : (
                          <>
                            <Mail className="h-3.5 w-3.5" />
                            Send invite
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty total={initialWaitlist.length} />
        )}
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden space-y-3">
        {visible.length > 0 ? (
          visible.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-2xl border border-gray-100 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#2F3E4E] truncate" style={FONT}>
                    {w.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5" style={FONT}>
                    Joined {fmtDate(w.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleSendInvite(w.email)}
                  disabled={sending === w.email || sent.has(w.email)}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#5F7E9D] rounded-xl hover:bg-[#4e6d8c] disabled:opacity-50"
                  style={FONT}
                >
                  {sending === w.email ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : sent.has(w.email) ? (
                    <>
                      <Mail className="h-3.5 w-3.5" />
                      Sent
                    </>
                  ) : (
                    <>
                      <Mail className="h-3.5 w-3.5" />
                      Send invite
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <Empty total={initialWaitlist.length} />
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowCount((n) => n + 20)}
            className="px-4 py-2 text-sm font-medium text-[#5F7E9D] bg-[#5F7E9D]/10 rounded-xl hover:bg-[#5F7E9D]/20 transition-colors"
            style={FONT}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

function Empty({ total }: { total: number }) {
  return (
    <div className="py-16 text-center">
      <ClipboardList className="h-8 w-8 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-400" style={FONT}>
        {total === 0 ? "No one on the waitlist yet" : "No waitlist entries match your search"}
      </p>
    </div>
  );
}
