"use client";

import Link from "next/link";
import {
  PawPrint,
  UserCheck,
  Heart,
  ArrowLeftRight,
  Trophy,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

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

interface Props {
  stats: { dogs: number; owners: number; caregivers: number; matches: number };
  matchesByStatus: { suggested: number; contacted: number; accepted: number; rejected: number };
  matchesByTier: { high: number; medium: number; low: number };
  topCaregiver: { name: string; avg: number; count: number } | null;
  recentMatches: {
    id: string;
    dogName: string;
    caregiverName: string;
    score: number;
    tier: string;
    status: string;
    created_at: string;
  }[];
}

const TIER_COLORS = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-rose-400",
};

const STATUS_COLORS = {
  suggested: "bg-slate-200",
  contacted: "bg-blue-400",
  accepted: "bg-emerald-500",
  rejected: "bg-rose-400",
};

export function AdminOverviewPage({
  stats,
  matchesByStatus,
  matchesByTier,
  topCaregiver,
  recentMatches,
}: Props) {
  const totalTier = matchesByTier.high + matchesByTier.medium + matchesByTier.low;
  const totalStatus = matchesByStatus.suggested + matchesByStatus.contacted + matchesByStatus.accepted + matchesByStatus.rejected;

  return (
    <div className="space-y-6 md:space-y-8" style={FONT}>
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-[#260900] tracking-tight">
          Dashboard Overview
        </h1>
        <p className=" text-[#6B7280] text-sm text-gray-500 mt-1">
          Key metrics and performance at a glance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Link
          href="/dashboard/admin/dogs"
          className="group bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm hover:shadow-md hover:border-[#5F7E9D]/20 transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#6B7280]text-xs font-medium text-gray-500 uppercase tracking-wider">Dogs</p>
              <p className="text-2xl md:text-3xl font-semibold text-[#260900] mt-1">{stats.dogs}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
              <PawPrint className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-[#F3B443] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View all <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </div>
        </Link>

        <Link
          href="/dashboard/admin/owners"
          className="group bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm hover:shadow-md hover:border-[#5F7E9D]/20 transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#6B7280] text-xs font-medium text-gray-500 uppercase tracking-wider">Owners</p>
              <p className="text-2xl md:text-3xl font-semibold text-[#260900] mt-1">{stats.owners}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <UserCheck className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-[#F3B443] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View all <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </div>
        </Link>

        <Link
          href="/dashboard/admin/caregivers"
          className="group bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm hover:shadow-md hover:border-[#5F7E9D]/20 transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#6B7280] text-xs font-medium text-gray-500 uppercase tracking-wider">Caregivers</p>
              <p className="text-2xl md:text-3xl font-semibold text-[#260900] mt-1">{stats.caregivers}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <Heart className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-[#F3B443] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View all <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </div>
        </Link>

        <Link
          href="/dashboard/admin/matches"
          className="group bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm hover:shadow-md hover:border-[#5F7E9D]/20 transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#6B7280] text-xs font-medium text-gray-500 uppercase tracking-wider">Matches</p>
              <p className="text-2xl md:text-3xl font-semibold text-[#260900] mt-1">{stats.matches}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-100 transition-colors">
              <ArrowLeftRight className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-[#F3B443] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View all <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </div>
        </Link>
      </div>

      {/* Second row: Top Caregiver + Match breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Top Scorer Caregiver */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Trophy className="h-5 w-5" strokeWidth={2} />
            </div>
            <h2 className="text-base font-semibold text-[#260900]">Top Scorer</h2>
          </div>
          {topCaregiver ? (
            <div>
              <p className="text-lg font-semibold text-[#260900]">{topCaregiver.name}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#6B7280]">{topCaregiver.avg}</span>
                <span className="text-sm text-gray-500">avg score / 25</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{topCaregiver.count} matches</p>
              <Link
                href="/dashboard/admin/caregivers"
                className="mt-4 inline-flex items-center text-sm font-medium text-[#F3B443] hover:underline"
              >
                View caregivers <ChevronRight className="h-4 w-4 ml-0.5" />
              </Link>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No matches yet</p>
          )}
        </div>

        {/* Match Tier Breakdown */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <TrendingUp className="h-5 w-5" strokeWidth={2} />
            </div>
            <h2 className="text-base font-semibold text-[#260900]">Match Quality</h2>
          </div>
          {totalTier > 0 ? (
            <div className="space-y-3">
              {(["high", "medium", "low"] as const).map((tier) => {
                const val = matchesByTier[tier];
                const pct = Math.round((val / totalTier) * 100);
                return (
                  <div key={tier}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{cap(tier)}</span>
                      <span className="text-gray-500">{val} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${TIER_COLORS[tier]} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No matches yet</p>
          )}
        </div>

        {/* Match Status Breakdown */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-violet-100 text-violet-600">
              <ArrowLeftRight className="h-5 w-5" strokeWidth={2} />
            </div>
            <h2 className="text-base font-semibold text-[#260900]">Match Status</h2>
          </div>
          {totalStatus > 0 ? (
            <div className="space-y-3">
              {(["suggested", "contacted", "accepted", "rejected"] as const).map((status) => {
                const val = matchesByStatus[status];
                const pct = Math.round((val / totalStatus) * 100);
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{cap(status)}</span>
                      <span className="text-gray-500">{val} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_COLORS[status]} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No matches yet</p>
          )}
        </div>
      </div>

      {/* Recent Matches */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 md:px-6 md:py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#260900]">Recent Matches</h2>
          <Link
            href="/dashboard/admin/matches"
            className="text-sm font-medium text-[#5F7E9D] hover:underline flex items-center gap-1"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recentMatches.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#260900] uppercase tracking-wider">
                        Dog
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#260900] uppercase tracking-wider">
                        Caregiver
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#260900] uppercase tracking-wider">
                        Score
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#260900] uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#260900] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#260900] uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMatches.map((m) => (
                      <tr
                        key={m.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-[#2F3E4E]">{m.dogName}</td>
                        <td className="px-4 py-3 text-gray-600">{m.caregiverName}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium tabular-nums">{m.score}/25</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              m.tier === "high"
                                ? "bg-emerald-50 text-emerald-700"
                                : m.tier === "medium"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {cap(m.tier)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              m.status === "accepted"
                                ? "bg-emerald-50 text-emerald-700"
                                : m.status === "rejected"
                                  ? "bg-rose-50 text-rose-600"
                                  : m.status === "contacted"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {cap(m.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{fmtDate(m.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {recentMatches.map((m) => (
                  <div
                    key={m.id}
                    className="px-4 py-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-[#2F3E4E]">{m.dogName}</p>
                        <p className="text-sm text-gray-500">{m.caregiverName}</p>
                      </div>
                      <span className="font-semibold text-[#5F7E9D] tabular-nums shrink-0">
                        {m.score}/25
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          m.tier === "high"
                            ? "bg-emerald-50 text-emerald-700"
                            : m.tier === "medium"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {cap(m.tier)}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          m.status === "accepted"
                            ? "bg-emerald-50 text-emerald-700"
                            : m.status === "rejected"
                              ? "bg-rose-50 text-rose-600"
                              : m.status === "contacted"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {cap(m.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">{fmtDate(m.created_at)}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ArrowLeftRight className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No matches yet</p>
              <Link
                href="/dashboard/admin/matches"
                className="mt-2 text-sm font-medium text-[#5F7E9D] hover:underline"
              >
                Create a match
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
