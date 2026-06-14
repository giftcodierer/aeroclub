"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const itemBaseClass = "text-lg font-semibold tracking-wide h-12 px-4";
  const role = session?.user?.role;

  return (
    <Sidebar className="font-[var(--font-geist-sans)]">
      <SidebarHeader className="text-lg font-bold tracking-tight">
        Navigation
      </SidebarHeader>

      <SidebarMenu>
        <SidebarMenuButton asChild className={itemBaseClass} isActive={pathname === "/"}>
          <Link href="/">Dashboard</Link>
        </SidebarMenuButton>
      </SidebarMenu>

      <SidebarMenu>
        <SidebarMenuButton asChild className={itemBaseClass} isActive={pathname === "/flights"}>
          <Link href="/flights">Flüge</Link>
        </SidebarMenuButton>
      </SidebarMenu>

      <SidebarMenu>
        <SidebarMenuButton asChild className={itemBaseClass} isActive={pathname === "/airplanes"}>
          <Link href="/airplanes">Flugzeuge</Link>
        </SidebarMenuButton>
      </SidebarMenu>

      <SidebarMenu>
        <SidebarMenuButton asChild className={itemBaseClass} isActive={pathname === "/members"}>
          <Link href="/members">Mitglieder</Link>
        </SidebarMenuButton>
      </SidebarMenu>

      <SidebarMenu>
        <SidebarMenuButton asChild className={itemBaseClass} isActive={pathname === "/settings"}>
          <Link href="/settings">Einstellungen</Link>
        </SidebarMenuButton>
      </SidebarMenu>

      <SidebarFooter className="mt-auto border-t pt-4 pb-2 px-4">
        {session?.user && (
          <div className="mb-3">
            <p className="text-sm font-semibold text-slate-800 truncate">{session.user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
            <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
              role === "ADMIN"
                ? "bg-amber-100 text-amber-700 ring-amber-200"
                : role === "DISPATCHER"
                ? "bg-sky-100 text-sky-700 ring-sky-200"
                : "bg-slate-100 text-slate-600 ring-slate-200"
            }`}>
              {role === "ADMIN" ? "Admin" : role === "DISPATCHER" ? "Dispatcher" : "Benutzer"}
            </span>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Abmelden
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
