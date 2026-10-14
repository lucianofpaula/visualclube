"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
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
  LayoutDashboard,
  Globe,
  LogOut,
  ChevronDown,
  Store,
  ExternalLink,
} from "lucide-react";
import { logoutUserAction } from "@/actions/auth";
import type { SessionPayload } from "@/lib/auth";

interface LandingUserMenuProps {
  user: SessionPayload;
  barbershop?: {
    id: string;
    name: string;
    subdomain: string;
  } | null;
}

export function LandingUserMenu({ user, barbershop }: LandingUserMenuProps) {
  const router = useRouter();
  const [isLoggingOut, startTransition] = React.useTransition();

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
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800/80 hover:border-amber-500/40 transition-all outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 cursor-pointer group">
        <Avatar className="h-8 w-8 rounded-full border border-amber-500/40">
          <AvatarFallback className="bg-amber-500/20 text-amber-300 font-bold text-xs">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors truncate max-w-[120px]">
            {user.name.split(" ")[0]}
          </span>
          <span className="text-[10px] text-amber-400/90 font-mono -mt-0.5 truncate max-w-[120px]">
            {barbershop ? barbershop.name : "Painel Ativo"}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400 group-hover:text-amber-400 transition-colors mr-0.5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-60 bg-zinc-950 border-zinc-800 text-zinc-100 p-1.5 shadow-xl"
        align="end"
        sideOffset={6}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-2 font-normal">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 rounded-full border border-amber-500/40 shrink-0">
                <AvatarFallback className="bg-amber-500/20 text-amber-300 font-bold text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-zinc-100 truncate">
                  {user.name}
                </span>
                <span className="text-xs text-zinc-400 truncate">
                  {user.email}
                </span>
                {barbershop && (
                  <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                    <Store className="h-2.5 w-2.5" />
                    {barbershop.subdomain}.visualclube
                  </span>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-zinc-800" />

        <DropdownMenuGroup>
          {/* Opção 1: Acessar Painel */}
          <DropdownMenuItem
            className="cursor-pointer focus:bg-zinc-800/80 focus:text-white flex items-center gap-2.5 py-2"
            onClick={() => router.push("/painel")}
          >
            <LayoutDashboard className="h-4 w-4 text-amber-400" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold">Acessar Painel</span>
              <span className="text-[10px] text-zinc-400">
                Central de comando da barbearia
              </span>
            </div>
          </DropdownMenuItem>

          {/* Opção 2: Acessar Meu Site */}
          <DropdownMenuItem
            className="cursor-pointer focus:bg-zinc-800/80 focus:text-white flex items-center gap-2.5 py-2"
            onClick={() => {
              if (barbershop) {
                window.open(`/b/${barbershop.subdomain}`, "_blank");
              } else {
                router.push("/painel/barbearia");
              }
            }}
          >
            <Globe className="h-4 w-4 text-emerald-400" />
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Acessar Meu Site</span>
                {barbershop && (
                  <ExternalLink className="h-3 w-3 text-zinc-500" />
                )}
              </div>
              <span className="text-[10px] text-zinc-400">
                {barbershop
                  ? "Página pública de agendamentos"
                  : "Configurar perfil da barbearia"}
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-zinc-800" />

        {/* Opção 3: Sair */}
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer text-red-400 focus:bg-red-950/40 focus:text-red-300 py-2"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span className="text-xs font-semibold">
            {isLoggingOut ? "Encerrando sessão..." : "Sair da Conta"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
