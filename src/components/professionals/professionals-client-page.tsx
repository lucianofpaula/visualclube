"use client";

import * as React from "react";
import { ProfessionalStatus } from "@/validations/professional";
import { getProfessionalsAction } from "@/actions/professionals";
import { ProfessionalsList } from "@/components/professionals/professionals-list";
import { CreateProfessionalDialog } from "@/components/professionals/create-professional-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserPlus,
  Users,
  UserCheck,
  Clock,
  Sparkles,
  Search,
  Scissors,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProfessionalItem {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  avatarUrl: string | null;
  bio: string | null;
  specialties: string[];
  status: ProfessionalStatus;
  inviteToken: string | null;
  inviteExpiresAt: Date | null;
  createdAt: Date;
}

interface ProfessionalsClientPageProps {
  initialProfessionals: ProfessionalItem[];
  appUrl: string;
}

export function ProfessionalsClientPage({
  initialProfessionals,
  appUrl,
}: ProfessionalsClientPageProps) {
  const [professionals, setProfessionals] =
    React.useState<ProfessionalItem[]>(initialProfessionals);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const refreshProfessionals = async () => {
    const updated = await getProfessionalsAction();
    setProfessionals(updated);
  };

  const totalCount = professionals.length;
  const activeCount = professionals.filter(
    (p) => p.status === ProfessionalStatus.ACTIVE
  ).length;
  const pendingCount = professionals.filter(
    (p) => p.status === ProfessionalStatus.PENDING_REGISTRATION
  ).length;

  const filteredProfessionals = professionals.filter((prof) => {
    const matchesSearch =
      prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.whatsapp.includes(searchTerm) ||
      prof.specialties.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && prof.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Scissors className="h-3.5 w-3.5" />
            Equipe da Barbearia
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Profissionais & Barbeiros
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cadastre sua equipe, envie links de ativação via WhatsApp e acompanhe o status de cada profissional.
          </p>
        </div>

        <div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="lg"
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold gap-2 shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Cadastrar Profissional
          </Button>
        </div>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground block">
                Total de Profissionais
              </span>
              <span className="text-2xl font-bold text-foreground">
                {totalCount}
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground block">
                Ativos na Agenda
              </span>
              <span className="text-2xl font-bold text-emerald-500">
                {activeCount}
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground block">
                Pendentes de Convite
              </span>
              <span className="text-2xl font-bold text-amber-500">
                {pendingCount}
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail, especialidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs h-10"
          />
        </div>

        <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={statusFilter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("ALL")}
            className="text-xs h-8 cursor-pointer"
          >
            Todos ({totalCount})
          </Button>
          <Button
            variant={statusFilter === ProfessionalStatus.ACTIVE ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(ProfessionalStatus.ACTIVE)}
            className="text-xs h-8 cursor-pointer"
          >
            Ativos ({activeCount})
          </Button>
          <Button
            variant={
              statusFilter === ProfessionalStatus.PENDING_REGISTRATION
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() => setStatusFilter(ProfessionalStatus.PENDING_REGISTRATION)}
            className="text-xs h-8 cursor-pointer"
          >
            Pendentes ({pendingCount})
          </Button>
        </div>
      </div>

      {/* Lista de Profissionais */}
      <ProfessionalsList
        professionals={filteredProfessionals}
        appUrl={appUrl}
        onRefresh={refreshProfessionals}
      />

      {/* Modal de Criação com Compartilhamento WhatsApp */}
      <CreateProfessionalDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={refreshProfessionals}
      />
    </div>
  );
}
