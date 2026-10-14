"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProfessionalSchema,
  DEFAULT_SPECIALTIES,
  ProfessionalStatus,
  type CreateProfessionalInput,
} from "@/validations/professional";
import { createProfessionalAction } from "@/actions/professionals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Loader2,
  X,
  Check,
  Plus,
  Share2,
  Copy,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface CreateProfessionalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProfessionalDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateProfessionalDialogProps) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [createdInvite, setCreatedInvite] = React.useState<{
    name: string;
    whatsapp: string;
    inviteUrl: string;
  } | null>(null);
  const [customSpecialty, setCustomSpecialty] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProfessionalInput>({
    resolver: zodResolver(createProfessionalSchema),
    defaultValues: {
      name: "",
      email: "",
      whatsapp: "",
      specialties: ["Corte Degradê / Fade"],
      status: ProfessionalStatus.PENDING_REGISTRATION,
    },
  });

  const selectedSpecialties = watch("specialties") || [];

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }

    setValue("whatsapp", value, { shouldValidate: true });
  };

  const toggleSpecialty = (spec: string) => {
    if (selectedSpecialties.includes(spec)) {
      setValue(
        "specialties",
        selectedSpecialties.filter((s) => s !== spec),
        { shouldValidate: true }
      );
    } else {
      setValue("specialties", [...selectedSpecialties, spec], {
        shouldValidate: true,
      });
    }
  };

  const addCustomSpecialty = () => {
    if (customSpecialty.trim() && !selectedSpecialties.includes(customSpecialty.trim())) {
      setValue("specialties", [...selectedSpecialties, customSpecialty.trim()], {
        shouldValidate: true,
      });
      setCustomSpecialty("");
    }
  };

  const onSubmit = async (data: CreateProfessionalInput) => {
    setServerError(null);

    const result = await createProfessionalAction(data);

    if (!result.success || !result.data) {
      setServerError(result.message || "Erro ao salvar o profissional.");
      return;
    }

    setCreatedInvite({
      name: data.name,
      whatsapp: data.whatsapp,
      inviteUrl: result.data.inviteUrl,
    });

    onSuccess();
  };

  const handleCopyLink = () => {
    if (!createdInvite) return;
    navigator.clipboard.writeText(createdInvite.inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getWhatsAppShareUrl = () => {
    if (!createdInvite) return "";
    const cleanPhone = createdInvite.whatsapp.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(
      `Olá, ${createdInvite.name}! ✂️\n\nVocê foi cadastrado na nossa barbearia no Visual Club!\n\nPara concluir seu perfil profissional, adicionar sua foto, biografia e criar sua senha de acesso à agenda, acesse o link abaixo:\n\n${createdInvite.inviteUrl}\n\nSeja bem-vindo à equipe!`
    );
    return `https://wa.me/${formattedPhone}?text=${text}`;
  };

  const handleCloseModal = () => {
    reset();
    setCreatedInvite(null);
    setServerError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
        <button
          type="button"
          onClick={handleCloseModal}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {createdInvite ? (
          /* Tela de Sucesso com Compartilhamento WhatsApp */
          <div className="space-y-6 py-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Sparkles className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-foreground">
                Profissional Pré-Cadastrado!
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                O registro de <strong>{createdInvite.name}</strong> foi criado com sucesso. Agora envie o link para ele concluir a senha, foto e biografia.
              </p>
            </div>

            {/* Caixa com o Link de Convite */}
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-left space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Link de Conclusão do Cadastro
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdInvite.inviteUrl}
                  className="flex-1 bg-background text-foreground text-xs rounded-lg px-3 py-2 border border-border outline-none font-mono select-all"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="gap-1.5 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-medium">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Ações de Compartilhamento */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2 font-semibold">
                  <MessageCircle className="h-4 w-4" />
                  Enviar via WhatsApp
                </Button>
              </a>
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="flex-1"
              >
                Concluir & Fechar
              </Button>
            </div>
          </div>
        ) : (
          /* Formulário de Cadastro do Profissional */
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-wider">
                <UserPlus className="h-4 w-4" />
                Novo Integrante
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Cadastrar Profissional
              </h2>
              <p className="text-sm text-muted-foreground">
                Informe os dados básicos do barbeiro ou especialista da sua equipe.
              </p>
            </div>

            {serverError && (
              <div className="p-3 text-sm rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="prof-name" required>
                    Nome Completo
                  </Label>
                  <Input
                    id="prof-name"
                    placeholder="Ex: Matheus Silva"
                    disabled={isSubmitting}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* E-mail */}
                <div className="space-y-1.5">
                  <Label htmlFor="prof-email" required>
                    E-mail
                  </Label>
                  <Input
                    id="prof-email"
                    type="email"
                    placeholder="barbeiro@email.com"
                    disabled={isSubmitting}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* WhatsApp */}
                <div className="space-y-1.5">
                  <Label htmlFor="prof-whatsapp" required>
                    WhatsApp com DDD
                  </Label>
                  <Input
                    id="prof-whatsapp"
                    placeholder="(21) 99999-9999"
                    disabled={isSubmitting}
                    {...register("whatsapp")}
                    onChange={handleWhatsappChange}
                  />
                  {errors.whatsapp && (
                    <p className="text-xs text-destructive">{errors.whatsapp.message}</p>
                  )}
                </div>
              </div>

              {/* Especialidades */}
              <div className="space-y-2 pt-1">
                <Label required>Especialidades & Habilidades</Label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-lg border border-border bg-muted/20">
                  {DEFAULT_SPECIALTIES.map((spec) => {
                    const isSelected = selectedSpecialties.includes(spec);
                    return (
                      <button
                        type="button"
                        key={spec}
                        onClick={() => toggleSpecialty(spec)}
                        className={`text-xs px-2.5 py-1 rounded-full transition-all flex items-center gap-1 border ${
                          isSelected
                            ? "bg-amber-500 text-zinc-950 font-semibold border-amber-500"
                            : "bg-card text-muted-foreground border-border hover:border-amber-500/50"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        {spec}
                      </button>
                    );
                  })}
                </div>

                {/* Adicionar especialidade customizada */}
                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="Outra especialidade personalizada..."
                    value={customSpecialty}
                    onChange={(e) => setCustomSpecialty(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomSpecialty();
                      }
                    }}
                    className="text-xs h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomSpecialty}
                    className="shrink-0 gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar
                  </Button>
                </div>
                {errors.specialties && (
                  <p className="text-xs text-destructive">
                    {errors.specialties.message}
                  </p>
                )}
              </div>

              {/* Status Inicial */}
              <div className="space-y-1.5 pt-1">
                <Label>Status Inicial do Profissional</Label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      watch("status") === ProfessionalStatus.PENDING_REGISTRATION
                        ? "border-amber-500 bg-amber-500/10 text-foreground font-medium"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      value={ProfessionalStatus.PENDING_REGISTRATION}
                      className="sr-only"
                      {...register("status")}
                    />
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <div className="text-xs">
                      <strong>Aguardando Conclusão</strong>
                      <span className="block text-[10px] text-muted-foreground">
                        Profissional completa via link
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      watch("status") === ProfessionalStatus.ACTIVE
                        ? "border-emerald-500 bg-emerald-500/10 text-foreground font-medium"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      value={ProfessionalStatus.ACTIVE}
                      className="sr-only"
                      {...register("status")}
                    />
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <div className="text-xs">
                      <strong>Ativo Imediatamente</strong>
                      <span className="block text-[10px] text-muted-foreground">
                        Disponível na agenda
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Cadastrar & Gerar Link
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
