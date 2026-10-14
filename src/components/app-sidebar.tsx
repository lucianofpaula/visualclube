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
import { Scissors, LayoutDashboard, UserCheck } from "lucide-react";
import type { SessionPayload } from "@/lib/auth";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: SessionPayload;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const sidebarData = {
    teams: [
      {
        name: "Visual Club",
        logo: <Scissors className="size-4" />,
        plan: "Unidade Principal",
      },
    ],
    navMain: [
      {
        title: "Visão Geral",
        url: "/painel",
        icon: <LayoutDashboard className="size-4" />,
        isActive: true,
        items: [
          {
            title: "Dashboard",
            url: "/painel",
          },
        ],
      },
      {
        title: "Profissionais",
        url: "/painel/profissionais",
        icon: <UserCheck className="size-4" />,
        items: [
          {
            title: "Equipe & Cadastros",
            url: "/painel/profissionais",
          },
        ],
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
