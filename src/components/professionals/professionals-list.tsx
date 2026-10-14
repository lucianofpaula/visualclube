"use client";

import * as React from "react";
import { ProfessionalStatus } from "@/validations/professional";
import {
  updateProfessionalStatusAction,
  regenerateInviteAction,
  deleteProfessionalAction,
} from "@/actions/professionals";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Phone,
  Mail,
  UserCheck,
  UserX,
  Clock,
  Sparkles,
  Scissors,
  CheckCircle2,
} from "lucide-react";

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

interface ProfessionalsListProps {
  professionals: ProfessionalItem[];
  appUrl: string;
  onRefresh: () => void;
}

export function ProfessionalsList({
  professionals,
  appUrl,
  onRefresh,
}: ProfessionalsListProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getWhatsAppShareUrl = (prof: ProfessionalItem) => {
    if (!prof.inviteToken) return "";
    const cleanPhone = prof.whatsapp.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    const inviteUrl = `${appUrl}/convite/profissional/${prof.inviteToken}`;
    const text = encodeURIComponent(
      `Olá, ${prof.name}! ✂️\n\nVocê foi cadastrado na nossa barbearia no Visual Club!\n\nPara concluir seu perfil profissional, adicionar sua foto, biografia e criar sua senha de acesso à agenda, acesse o link abaixo:\n\n${inviteUrl}\n\nSeja bem-vindo à equipe!`
    );
    return `https://wa.me/${formattedPhone}?text=${text}`;
  };

  const handleCopyLink = (prof: ProfessionalItem) => {
    if (!prof.inviteToken) return;
    const inviteUrl = `${appUrl}/convite/profissional/${prof.inviteToken}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedId(prof.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleStatus = async (prof: ProfessionalItem) => {
    setLoadingId(prof.id);
    const nextStatus =
      prof.status === ProfessionalStatus.ACTIVE
        ? ProfessionalStatus.INACTIVE
        : ProfessionalStatus.ACTIVE;

    await updateProfessionalStatusAction(prof.id, nextStatus);
    setLoadingId(null);
    onRefresh();
  };

  const handleRegenerateInvite = async (id: string) => {
    setLoadingId(id);
    await regenerateInviteAction(id);
    setLoadingId(null);
    onRefresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja remover o profissional "${name}"?`)) {
      return;
    }
    setLoadingId(id);
    await deleteProfessionalAction(id);
    setLoadingId(null);
    onRefresh();
  };

  if (professionals.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-border p-12 text-center bg-card/40">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-4">
          <Scissors className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Nenhum profissional cadastrado ainda
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
          Cadastre os barbeiros e especialistas da sua barbearia para gerenciar a agenda, comissões e atendimentos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {professionals.map((prof) => {
        const isPending = prof.status === ProfessionalStatus.PENDING_REGISTRATION;
        const isActive = prof.status === ProfessionalStatus.ACTIVE;

        return (
          <div
            key={prof.id}
            className="flex flex-col justify-between rounded-sm border border-border bg-card p-5 shadow-sm hover:border-primary/40 transition-all text-card-foreground"
          >
            <div>
              {/* Header do Card com Foto, Nome e Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 rounded-sm border border-border shadow-xs">
                    {prof.avatarUrl && (
                      <AvatarImage src={prof.avatarUrl} alt={prof.name} />
                    )}
                    <AvatarFallback className="rounded-sm bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-sm">
                      {getInitials(prof.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-base text-foreground leading-tight">
                      {prof.name}
                    </h4>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3" />
                      {prof.email}
                    </span>
                  </div>
                </div>

                {/* Badge de Status */}
                <div>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Ativo
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Pendente
                    </span>
                  )}
                  {prof.status === ProfessionalStatus.INACTIVE && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      Inativo
                    </span>
                  )}
                </div>
              </div>

              {/* Informações de Contato e Bio */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-amber-500" />
                  <a
                    href={`tel:${prof.whatsapp.replace(/\D/g, "")}`}
                    className="hover:text-foreground font-medium transition-colors"
                  >
                    {prof.whatsapp}
                  </a>
                </div>

                {prof.bio && (
                  <p className="text-muted-foreground italic line-clamp-2 pt-1">
                    &ldquo;{prof.bio}&rdquo;
                  </p>
                )}

                {/* Especialidades */}
                <div className="pt-2 flex flex-wrap gap-1">
                  {prof.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-muted/60 text-muted-foreground border border-border font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Ações e Compartilhamento de Convite */}
            <div className="mt-5 pt-4 border-t border-border space-y-2.5">
              {/* Se o profissional estiver com cadastro pendente, exibe os botões de envio */}
              {prof.inviteToken && (
                <div className="rounded-sm bg-amber-500/10 border border-amber-500/20 p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Convite pendente de conclusão
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={getWhatsAppShareUrl(prof)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        size="sm"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs font-semibold h-8"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Enviar no WhatsApp
                      </Button>
                    </a>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(prof)}
                      className="h-8 px-2.5 text-xs gap-1"
                      title="Copiar Link de Convite"
                    >
                      {copiedId === prof.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-500 text-[10px]">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span className="text-[10px]">Copiar</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Botões de Gestão (Status, Regenerar, Excluir) */}
              <div className="flex items-center justify-between gap-1 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleStatus(prof)}
                  disabled={loadingId === prof.id}
                  className="text-xs h-7 px-2 gap-1 text-muted-foreground hover:text-foreground"
                >
                  {isActive ? (
                    <>
                      <UserX className="h-3 w-3 text-amber-500" />
                      Desativar
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3 w-3 text-emerald-500" />
                      Ativar
                    </>
                  )}
                </Button>

                {!prof.inviteToken && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRegenerateInvite(prof.id)}
                    disabled={loadingId === prof.id}
                    className="text-xs h-7 px-2 gap-1 text-muted-foreground hover:text-foreground"
                    title="Gerar novo link de atualização"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Novo Link
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(prof.id, prof.name)}
                  disabled={loadingId === prof.id}
                  className="text-xs h-7 px-2 gap-1 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
