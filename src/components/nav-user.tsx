"use client";

import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ChevronsUpDownIcon,
  SparklesIcon,
  BadgeCheckIcon,
  CreditCardIcon,
  BellIcon,
  LogOutIcon,
  ShieldAlertIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { logoutUserAction } from "@/actions/auth";
import type { SessionPayload } from "@/lib/auth";

export function NavUser({
  user,
}: {
  user: SessionPayload & { avatar?: string };
}) {
  const { isMobile } = useSidebar();
  const { setTheme, resolvedTheme } = useTheme();
  const [isLoggingOut, startTransition] = React.useTransition();

  // Obter as iniciais do nome do usuário para o Avatar
  const getInitials = (name: string) => {
    if (!name) return "VC";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUserAction();
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="h-8 w-8 rounded-lg">
              {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
              <AvatarFallback className="rounded-lg bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium text-foreground">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                    <AvatarFallback className="rounded-lg bg-amber-500/20 text-amber-500 dark:text-amber-300 font-semibold text-xs border border-amber-500/30">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-foreground">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    <span className="mt-0.5 inline-block text-[10px] uppercase font-mono text-amber-600 dark:text-amber-400 font-semibold">
                      Função: {user.role}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <SparklesIcon className="text-amber-400" />
                <span>Atualizar para Pro</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <BadgeCheckIcon />
                <span>Minha Conta</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <CreditCardIcon />
                <span>Planos & Assinatura</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <BellIcon />
                <span>Notificações</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              >
                {resolvedTheme === "dark" ? (
                  <>
                    <SunIcon className="text-amber-500" />
                    <span>Mudar para Modo Claro</span>
                  </>
                ) : (
                  <>
                    <MoonIcon className="text-amber-400" />
                    <span>Mudar para Modo Escuro</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-950/40"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOutIcon />
              <span>{isLoggingOut ? "Encerrando..." : "Sair do Sistema"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
