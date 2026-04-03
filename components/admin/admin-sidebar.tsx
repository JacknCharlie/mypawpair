"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PawPrint,
  UserCheck,
  Heart,
  ArrowLeftRight,
  Users,
  ClipboardList,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Dogs", href: "/dashboard/admin/dogs", icon: PawPrint },
  { label: "Dog Owners", href: "/dashboard/admin/owners", icon: UserCheck },
  { label: "Caregivers", href: "/dashboard/admin/caregivers", icon: Heart },
  { label: "Matches", href: "/dashboard/admin/matches", icon: ArrowLeftRight },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Waitlist", href: "/dashboard/admin/waitlist", icon: ClipboardList },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <Link href="/dashboard/admin" className="flex items-center">
          <Image
            src="/logo.png"
            alt="myPawPair"
            width={140}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard/admin"
              ? pathname === "/dashboard/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                isActive
                  ? "bg-[rgba(243,180,67,0.5)] text-[#260900]"
                  : " hover:!bg-[rgba(243,180,67,0.5)] hover:text-[#260900]"
              }`}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Icon
                className={`h-[18px] w-[18px] shrink-0 ${
                  isActive ? "text-[#260900]" : "text-gray-400"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <p
          className="text-[11px] text-gray-400 font-medium"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          myPawPair Admin
        </p>
      </div>
    </aside>
  );
}
