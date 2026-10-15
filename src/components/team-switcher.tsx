"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { ChevronsUpDownIcon, PlusIcon, StoreIcon } from "lucide-react";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ReactNode;
    plan: string;
  }[];
}) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  React.useEffect(() => {
    if (teams && teams[0]) {
      setActiveTeam(teams[0]);
    }
  }, [teams]);

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20">
              {activeTeam.logo}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-foreground">{activeTeam.name}</span>
              <span className="truncate text-xs text-amber-600 dark:text-amber-400 font-medium">{activeTeam.plan}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto text-muted-foreground size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
                Estabelecimentos
              </DropdownMenuLabel>
              {teams.map((team, index) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                  className="gap-2.5 p-2 cursor-pointer"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border border-border bg-muted text-amber-500">
                    {team.logo}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{team.name}</span>
                    <span className="text-[10px] text-muted-foreground">{team.plan}</span>
                  </div>
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={<Link href="/painel/barbearia" />}
                className="gap-2 p-2 cursor-pointer text-amber-500 hover:text-amber-400 focus:text-amber-300"
              >
                <div className="flex size-6 items-center justify-center rounded-md border border-amber-500/40 bg-amber-500/10">
                  <StoreIcon className="size-3.5 text-amber-500" />
                </div>
                <div className="font-medium text-xs">
                  Configurar Barbearia
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
