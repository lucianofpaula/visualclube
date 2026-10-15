"use client";

import * as React from "react";
import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Globe,
  Phone,
  MessageCircle,
  Building2,
  ExternalLink,
  Users,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  generateSubdomainFromName,
  sanitizeSubdomain,
  formatPhone,
  DEFAULT_WEEK_SCHEDULE,
  DaySchedule,
  BarbershopFormData,
} from "@/validations/barbershop";
import { saveBarbershopAction } from "@/actions/barbershop";

interface BarbershopWizardProps {
  initialData?: any | null;
}

export function BarbershopWizard({ initialData }: BarbershopWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Flag indicating if barbershop is already registered in DB
  const [hasExistingBarbershop, setHasExistingBarbershop] = useState<boolean>(
    Boolean(initialData)
  );

  // Wizard Step (1: Dados, 2: Endereço, 3: Horários, 4: Identidade & Conclusão)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Reference to focus on address number after CEP search
  const numberInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingCep, setIsLoadingCep] = useState<boolean>(false);
  const [cepError, setCepError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<BarbershopFormData>({
    name: initialData?.name || "",
    subdomain: initialData?.subdomain || "",
    phone: formatPhone(initialData?.phone || ""),
    whatsapp: formatPhone(initialData?.whatsapp || ""),
    description: initialData?.description || "",

    postalCode: initialData?.postalCode || "",
    address: initialData?.address || "",
    number: initialData?.number || "",
    complement: initialData?.complement || "",
    neighborhood: initialData?.neighborhood || "",
    city: initialData?.city || "",
    state: initialData?.state || "",

    openingHours: initialData?.openingHours || DEFAULT_WEEK_SCHEDULE,

    customDomain: initialData?.customDomain || "",
    logoUrl: initialData?.logoUrl || "",
    bannerUrl: initialData?.bannerUrl || "",
  });

  // Flag to know if user manually edited subdomain
  const [userEditedSubdomain, setUserEditedSubdomain] = useState<boolean>(
    Boolean(initialData?.subdomain)
  );

  // Update name and auto-generate slug (without hyphens by default: barbeariadoluciano)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: newName,
      subdomain: userEditedSubdomain
        ? prev.subdomain
        : generateSubdomainFromName(newName),
    }));
  };

  // Subdomain manual editing
  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserEditedSubdomain(true);
    setFormData((prev) => ({
      ...prev,
      subdomain: sanitizeSubdomain(e.target.value),
    }));
  };

  // WhatsApp e Telefone com máscara brasileira (XX) XXXXX-XXXX
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      whatsapp: formatPhone(e.target.value),
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      phone: formatPhone(e.target.value),
    }));
  };

  // CEP Mask and Search via ViaCEP
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 8);
    const maskedCep =
      rawVal.length > 5 ? `${rawVal.slice(0, 5)}-${rawVal.slice(5)}` : rawVal;

    setFormData((prev) => ({ ...prev, postalCode: maskedCep }));
    setCepError(null);

    // Se completou 8 dígitos, buscar automaticamente no ViaCEP
    if (rawVal.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${rawVal}/json/`);
        const data = await response.json();

        if (data.erro) {
          setCepError("CEP não encontrado. Por favor, preencha o endereço manualmente.");
        } else {
          setFormData((prev) => ({
            ...prev,
            address: data.logradouro || prev.address,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));

          // Focar automaticamente no campo de número conforme solicitado!
          setTimeout(() => {
            numberInputRef.current?.focus();
          }, 150);
        }
      } catch (err) {
        setCepError("Erro ao consultar CEP. Preencha o endereço manualmente.");
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  // Toggle Day in schedule
  const handleToggleDay = (index: number) => {
    setFormData((prev) => {
      const hours = [...(prev.openingHours || DEFAULT_WEEK_SCHEDULE)];
      hours[index] = { ...hours[index], isOpen: !hours[index].isOpen };
      return { ...prev, openingHours: hours };
    });
  };

  // Change open/close time
  const handleTimeChange = (
    index: number,
    field: "openTime" | "closeTime",
    val: string
  ) => {
    setFormData((prev) => {
      const hours = [...(prev.openingHours || DEFAULT_WEEK_SCHEDULE)];
      hours[index] = { ...hours[index], [field]: val };
      return { ...prev, openingHours: hours };
    });
  };

  // Copy Monday hours to all working days
  const handleApplyMondayToAll = () => {
    setFormData((prev) => {
      const hours = [...(prev.openingHours || DEFAULT_WEEK_SCHEDULE)];
      const monday = hours[0];
      const updated = hours.map((h) =>
        h.dayKey === "sunday"
          ? h
          : { ...h, openTime: monday.openTime, closeTime: monday.closeTime }
      );
      return { ...prev, openingHours: updated };
    });
  };

  // Validation between steps
  const validateStep = (step: number): boolean => {
    setFeedback(null);
    if (step === 1) {
      if (!formData.name.trim() || formData.name.length < 2) {
        setFeedback({ type: "error", text: "Informe o nome da sua barbearia (mínimo 2 caracteres)." });
        return false;
      }
      if (!formData.subdomain || formData.subdomain.length < 3) {
        setFeedback({ type: "error", text: "O subdomínio deve ter pelo menos 3 caracteres." });
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!formData.number || !formData.number.trim()) {
        setFeedback({ type: "error", text: "O número do endereço é obrigatório." });
        numberInputRef.current?.focus();
        return false;
      }
      if (!formData.address?.trim() || !formData.city?.trim() || !formData.state?.trim()) {
        setFeedback({ type: "error", text: "Preencha o endereço completo (Rua, Cidade e Estado)." });
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setFeedback(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit complete form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setFeedback(null);
    startTransition(async () => {
      const res = await saveBarbershopAction(null, formData);
      if (res.success) {
        setHasExistingBarbershop(true);
        setFeedback({
          type: "success",
          text: res.message || "Barbearia configurada e salva com sucesso!",
        });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: res.message || "Ocorreu um erro ao salvar os dados da barbearia.",
        });
      }
    });
  };

  const steps = [
    { num: 1, title: "Dados Gerais", desc: "Nome & Subdomínio" },
    { num: 2, title: "Endereço", desc: "Localização & CEP" },
    { num: 3, title: "Horários", desc: "Dias de Atendimento" },
    { num: 4, title: "Identidade", desc: "Visual & Conclusão" },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Banner de Barbearia Ativa */}
      {hasExistingBarbershop && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-sm border border-emerald-500/30 bg-emerald-500/10 text-card-foreground">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                Barbearia Ativa & Publicada
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <span className="font-medium text-foreground">{formData.name || "Sua Barbearia"}</span>
                <span>•</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  {formData.subdomain}.visualclube.com.br
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Link
              href={`/b/${formData.subdomain}`}
              target="_blank"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "h-8 text-xs gap-1.5 border-emerald-500/40 hover:bg-emerald-500/20",
              })}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver Página Pública
            </Link>
            <Link
              href="/painel/profissionais"
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "h-8 text-xs gap-1.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold",
              })}
            >
              <Users className="h-3.5 w-3.5" />
              Profissionais
            </Link>
          </div>
        </div>
      )}

      {/* Indicador de Progresso / Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {steps.map((s) => {
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;
          const isClickable = isDone || hasExistingBarbershop;

          return (
            <div
              key={s.num}
              onClick={() => {
                if (isClickable) setCurrentStep(s.num);
              }}
              className={`p-3 rounded-sm border transition-all ${
                isClickable ? "cursor-pointer" : "pointer-events-none opacity-60"
              } ${
                isActive
                  ? "border-amber-500/60 bg-amber-500/10 shadow-sm"
                  : isClickable
                  ? "border-emerald-500/40 bg-emerald-500/5 text-muted-foreground hover:border-emerald-500/70"
                  : "border-border bg-card/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                    hasExistingBarbershop || isDone
                      ? "bg-emerald-500 text-black"
                      : isActive
                      ? "bg-amber-500 text-black"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {hasExistingBarbershop || isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    s.num
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate text-foreground">
                    {s.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
                    {s.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-sm border text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <div>
              <p className="font-semibold text-sm">{feedback.text}</p>
              {feedback.type === "success" && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Os dados foram atualizados com sucesso e estão visíveis em todo o sistema.
                </p>
              )}
            </div>
          </div>

          {feedback.type === "success" && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Link
                href={`/b/${formData.subdomain}`}
                target="_blank"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "h-8 text-xs gap-1.5 border-emerald-500/40 hover:bg-emerald-500/20",
                })}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ver Página Pública
              </Link>
              <Link
                href="/painel/profissionais"
                className={buttonVariants({
                  variant: "default",
                  size: "sm",
                  className: "h-8 text-xs gap-1.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold",
                })}
              >
                <Users className="h-3.5 w-3.5" />
                Profissionais
              </Link>
              <Link
                href="/painel"
                className={buttonVariants({
                  variant: "secondary",
                  size: "sm",
                  className: "h-8 text-xs gap-1.5",
                })}
              >
                Visão Geral
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Card do Formulário Step-by-Step */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-1.5 text-amber-500 mb-1">
            <Store className="h-4 w-4" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Passo {currentStep} de 4
            </span>
          </div>
          <CardTitle className="text-base sm:text-lg font-semibold">
            {currentStep === 1 && "Dados Principais da Barbearia"}
            {currentStep === 2 && "Endereço e Localização"}
            {currentStep === 3 && "Dias e Horários de Funcionamento"}
            {currentStep === 4 && "Identidade Visual e Domínio"}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {currentStep === 1 && "Defina o nome do seu negócio e o endereço web exclusivo para seus clientes agendarem."}
            {currentStep === 2 && "Digite o CEP para preenchimento automático e confirme o número do imóvel."}
            {currentStep === 3 && "Configure os horários de atendimento da sua barbearia para cada dia da semana."}
            {currentStep === 4 && "Adicione fotos, logotipo ou configure um domínio próprio para elevar sua marca."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ─── PASSO 1: DADOS GERAIS ───────────────────────────── */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="space-y-1.5">
                  <Label htmlFor="barbershop-name">
                    Nome da Barbearia
                  </Label>
                  <Input
                    id="barbershop-name"
                    placeholder="Ex: Barbearia do Luciano"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="h-10 text-sm"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome comercial visível para os clientes na página pública e no agendamento.
                  </p>
                </div>

                {/* Subdomínio Wildcard com visualização em tempo real */}
                <div className="space-y-2 p-3.5 rounded-sm bg-muted/40 border border-border">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="subdomain" className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-amber-500" />
                      Subdomínio Exclusivo
                    </Label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      (gerado automaticamente)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="subdomain"
                        value={formData.subdomain}
                        onChange={handleSubdomainChange}
                        placeholder="barbeariadoluciano"
                        className="font-mono text-sm pr-2"
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground shrink-0 bg-muted px-2.5 py-2 rounded-sm border border-border">
                      .visualclube.com.br
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Link público:</span>
                    <strong className="text-foreground font-mono font-normal">
                      https://{formData.subdomain || "suabarbearia"}.visualclube.com.br
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="whatsapp" className="flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                      WhatsApp de Atendimento *
                    </Label>
                    <Input
                      id="whatsapp"
                      placeholder="(11) 99999-9999"
                      value={formData.whatsapp || ""}
                      onChange={handleWhatsappChange}
                      maxLength={15}
                      className="h-10 text-sm font-mono"
                      required
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Usado para agendamentos rápidos via WhatsApp.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      Telefone Fixo / Adicional (Opcional)
                    </Label>
                    <Input
                      id="phone"
                      placeholder="(11) 3333-3333"
                      value={formData.phone || ""}
                      onChange={handlePhoneChange}
                      maxLength={15}
                      className="h-10 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">
                    Sobre a Barbearia (Opcional)
                  </Label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Conte um pouco sobre o conceito, tradição e diferenciais do seu espaço..."
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm shadow-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-amber-500 focus-visible:ring-1 focus-visible:ring-amber-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* ─── PASSO 2: ENDEREÇO & BUSCA POR CEP ────────────────── */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in-50 duration-200">
                <div className="p-4 rounded-sm bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-foreground flex items-start gap-2.5">
                  <Search className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-600 dark:text-amber-400">
                      Busca Automática por CEP
                    </p>
                    <p className="text-muted-foreground mt-0.5">
                      Digite os 8 dígitos do CEP da barbearia. O sistema completará o endereço e focará no número para sua confirmação.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="cep" className="flex items-center justify-between">
                      <span>CEP</span>
                      {isLoadingCep && (
                        <span className="text-[11px] text-amber-500 flex items-center gap-1 font-normal">
                          <Loader2 className="h-3 w-3 animate-spin" /> Buscando...
                        </span>
                      )}
                    </Label>
                    <Input
                      id="cep"
                      placeholder="00000-000"
                      value={formData.postalCode || ""}
                      onChange={handleCepChange}
                      maxLength={9}
                      className="h-10 font-mono text-sm"
                    />
                    {cepError && (
                      <p className="text-xs text-destructive">{cepError}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address">
                      Logradouro / Rua
                    </Label>
                    <Input
                      id="address"
                      placeholder="Ex: Rua das Flores"
                      value={formData.address || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, address: e.target.value }))
                      }
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="number" className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <span>Número</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        (foco automático)
                      </span>
                    </Label>
                    <Input
                      id="number"
                      ref={numberInputRef}
                      placeholder="123"
                      value={formData.number || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, number: e.target.value }))
                      }
                      className="h-10 border-amber-500/50 focus-visible:border-amber-500 font-medium text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="complement">
                      Complemento (Opcional)
                    </Label>
                    <Input
                      id="complement"
                      placeholder="Ex: Sala 2, Próximo ao metrô"
                      value={formData.complement || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, complement: e.target.value }))
                      }
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="neighborhood">
                      Bairro
                    </Label>
                    <Input
                      id="neighborhood"
                      placeholder="Centro"
                      value={formData.neighborhood || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, neighborhood: e.target.value }))
                      }
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="city">
                      Cidade
                    </Label>
                    <Input
                      id="city"
                      placeholder="São Paulo"
                      value={formData.city || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, city: e.target.value }))
                      }
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="state">
                      Estado (UF)
                    </Label>
                    <Input
                      id="state"
                      placeholder="SP"
                      maxLength={2}
                      value={formData.state || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          state: e.target.value.toUpperCase().slice(0, 2),
                        }))
                      }
                      className="h-10 uppercase font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ─── PASSO 3: DIAS E HORÁRIOS DE FUNCIONAMENTO ───────── */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in-50 duration-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-sm bg-muted/40 border border-border">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-amber-500" />
                      Grade Semanal de Atendimento
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Desmarque os dias em que a barbearia não abre (ex: Domingo).
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyMondayToAll}
                    className="text-xs shrink-0 rounded-sm"
                  >
                    Repetir horário de Seg nos demais dias
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {(formData.openingHours || DEFAULT_WEEK_SCHEDULE).map((item, idx) => (
                    <div
                      key={item.dayKey}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-sm border transition-colors gap-3 ${
                        item.isOpen
                          ? "bg-card border-border"
                          : "bg-muted/30 border-border/60 opacity-65"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`day-${item.dayKey}`}
                          checked={item.isOpen}
                          onChange={() => handleToggleDay(idx)}
                          className="h-4 w-4 rounded border-border text-amber-500 focus:ring-amber-500 cursor-pointer"
                        />
                        <Label
                          htmlFor={`day-${item.dayKey}`}
                          className="font-medium text-sm cursor-pointer select-none"
                        >
                          {item.dayLabel}
                        </Label>
                        {!item.isOpen && (
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            Fechado
                          </span>
                        )}
                      </div>

                      {item.isOpen ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">De</span>
                            <Input
                              type="time"
                              value={item.openTime}
                              onChange={(e) =>
                                handleTimeChange(idx, "openTime", e.target.value)
                              }
                              className="h-8 w-24 text-xs font-mono"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">às</span>
                            <Input
                              type="time"
                              value={item.closeTime}
                              onChange={(e) =>
                                handleTimeChange(idx, "closeTime", e.target.value)
                              }
                              className="h-8 w-24 text-xs font-mono"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Nenhum atendimento agendável
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── PASSO 4: IDENTIDADE & DOMÍNIO PRÓPRIO ───────────── */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in-50 duration-200">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="customDomain" className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-amber-500" />
                      Domínio Próprio (Opcional)
                    </Label>
                    <span className="text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-sm">
                      Pro / Premium
                    </span>
                  </div>
                  <Input
                    id="customDomain"
                    placeholder="ex: barbeariadoluciano.com.br"
                    value={formData.customDomain || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customDomain: e.target.value.toLowerCase().trim(),
                      }))
                    }
                    className="h-10 font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Se você já possui um domínio registrado no Registro.br ou GoDaddy, pode conectá-lo aqui.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="logoUrl">
                      Logotipo da Barbearia (Opcional)
                    </Label>
                    <ImageUpload
                      value={formData.logoUrl || ""}
                      onChange={(url) => setFormData((prev) => ({ ...prev, logoUrl: url }))}
                      folder="visualclube/logos"
                      aspectRatio="square"
                      description="Logo quadrado (PNG ou JPG até 5MB)"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bannerUrl">
                      Banner / Fachada da Barbearia (Opcional)
                    </Label>
                    <ImageUpload
                      value={formData.bannerUrl || ""}
                      onChange={(url) => setFormData((prev) => ({ ...prev, bannerUrl: url }))}
                      folder="visualclube/banners"
                      aspectRatio="banner"
                      description="Foto da fachada ou banner (até 5MB)"
                    />
                  </div>
                </div>

                {/* Resumo Final do Negócio */}
                <div className="p-4 rounded-sm border border-amber-500/30 bg-card space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Resumo do Cadastro
                  </h4>
                  <div className="text-xs space-y-1.5 text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Estabelecimento:</strong>{" "}
                      {formData.name || "(Não informado)"}
                    </p>
                    <p>
                      <strong className="text-foreground">Subdomínio Wildcard:</strong>{" "}
                      <span className="font-mono text-amber-500">
                        {formData.subdomain}.visualclube.com.br
                      </span>
                    </p>
                    <p>
                      <strong className="text-foreground">Endereço:</strong>{" "}
                      {formData.address}, {formData.number} - {formData.neighborhood}, {formData.city}/{formData.state}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ─── BOTÕES DE NAVEGAÇÃO ENTRE PASSOS ─────────────────── */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  disabled={isPending}
                  className="gap-2 text-xs"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs gap-2"
                >
                  Próximo Passo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 px-6"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando Barbearia...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {hasExistingBarbershop
                        ? "Atualizar Dados da Barbearia"
                        : "Salvar e Ativar Minha Barbearia"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
