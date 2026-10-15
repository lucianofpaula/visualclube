"use client";

import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Scissors, LayoutDashboard, UserCheck, Store } from "lucide-react";
import type { SessionPayload } from "@/lib/auth";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: SessionPayload;
  barbershop?: {
    name: string;
    subdomain: string;
    logoUrl?: string | null;
  } | null;
}

export function AppSidebar({ user, barbershop, ...props }: AppSidebarProps) {
  const sidebarData = {
    teams: [
      {
        name: barbershop?.name || "Visual Club",
        logo: barbershop?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={barbershop.logoUrl}
            alt={barbershop.name}
            className="size-5 rounded object-cover"
          />
        ) : (
          <Scissors className="size-4" />
        ),
        plan: barbershop?.subdomain
          ? `${barbershop.subdomain}.visualclube.com.br`
          : "Cadastre seu Negócio",
      },
    ],
    navMain: [
      {
        title: "Visão Geral",
        url: "/painel",
        icon: <LayoutDashboard className="size-4" />,
      },
      {
        title: "Minha Barbearia",
        url: "/painel/barbearia",
        icon: <Store className="size-4" />,
      },
      {
        title: "Profissionais",
        url: "/painel/profissionais",
        icon: <UserCheck className="size-4" />,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
