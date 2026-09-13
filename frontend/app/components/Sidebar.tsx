"use client";

import React from "react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import {
  Compass,
  SquaresFour,
  FileText,
  CreditCard,
  Folders,
  Receipt,
  UserGear,
  ListBullets,
  SignOut,
  Pill,
} from "@phosphor-icons/react";
import { SupportWidget } from "./SupportWidget";
import { useAuth } from "../context/AuthContext";
import { useTranslations } from "next-intl";

export function Sidebar() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const navItems = [
    { name: tNav("systemTour"), href: "/tour", icon: Compass },
    { name: tNav("dashboard"), href: "/dashboard", icon: SquaresFour },
    { name: tNav("myContracts"), href: "/contracts", icon: FileText },
    { name: tNav("myTariffs"), href: "/tariffs", icon: CreditCard },
    { name: tNav("myProjects"), href: "/projects", icon: Folders },
    { name: tNav("paymentHistory"), href: "/payments", icon: Receipt },
    { name: tNav("accountSettings"), href: "/profile/account", icon: UserGear },
    { name: tNav("activityLog"), href: "/journal", icon: ListBullets },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/start");
  };

  return (
    <aside className="w-64 bg-surface border-r border-border min-h-screen flex flex-col justify-between shrink-0 select-none">
      <div>
        <div className="h-16 px-5 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 text-accent flex items-center justify-center font-bold font-lexend group-hover:scale-105 transition-transform">
              <Pill size={20} weight="fill" />
            </div>
            <span className="font-lexend font-bold text-base text-primary tracking-tight block leading-none">
              {tNav("portal")}
            </span>
          </Link>
        </div>

        <nav className="px-3 space-y-1 mt-2">
          <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold text-muted uppercase tracking-wider">
            {tNav("mainNavigation")}
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-accent/15 text-accent border-l-4 border-accent shadow-xs"
                    : "text-secondary hover:text-primary hover:bg-surface-raised"
                }`}
              >
                <Icon size={18} className={isActive ? "text-accent" : "text-muted"} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-all duration-150 mt-2 cursor-pointer"
          >
            <SignOut size={18} className="text-red-500" />
            <span>{tCommon("logout")}</span>
          </button>
        </nav>
      </div>

      <div className="p-3">
        <SupportWidget />
      </div>
    </aside>
  );
}
