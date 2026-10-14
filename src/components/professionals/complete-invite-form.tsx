"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  completeProfessionalRegistrationSchema,
  type CompleteProfessionalRegistrationInput,
} from "@/validations/professional";
import { completeProfessionalRegistrationAction } from "@/actions/professionals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Scissors,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  User,
  Sparkles,
  Camera,
  FileText,
  Lock,
} from "lucide-react";
import Link from "next/link";

interface CompleteInviteFormProps {
  token: string;
  initialData: {
    id: string;
    name: string;
    email: string;
    whatsapp: string;
    specialties: string[];
    bio: string;
    avatarUrl: string;
  };
}

export function CompleteInviteForm({
  token,
  initialData,
}: CompleteInviteFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isCompleted, setIsCompleted] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompleteProfessionalRegistrationInput>({
    resolver: zodResolver(completeProfessionalRegistrationSchema),
    defaultValues: {
      name: initialData.name,
      avatarUrl: initialData.avatarUrl || "",
      bio: initialData.bio || "",
      password: "",
      confirmPassword: "",
    },
  });

  const avatarUrlPreview = watch("avatarUrl");

  const onSubmit = async (data: CompleteProfessionalRegistrationInput) => {
    setServerError(null);

    const result = await completeProfessionalRegistrationAction(token, data);

    if (!result.success) {
      setServerError(result.message || "Erro ao finalizar cadastro.");
      return;
    }

    setIsCompleted(true);
  };

  if (isCompleted) {
    return (
      <div className="text-center py-8 space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 animate-in zoom-in">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Cadastro Concluído com Sucesso! 🎉
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Seu perfil profissional foi ativado na equipe da barbearia. Agora você pode acessar o sistema com seu e-mail e sua nova senha.
          </p>
        </div>

        <div className="pt-4">
          <Link href="/login">
            <Button
              size="lg"
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold"
            >
              Fazer Login no Painel
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="flex items-center gap-3 p-3.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Dados Bloqueados da Barbearia */}
      <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">E-mail Cadastrado:</span>
          <span className="font-semibold text-foreground">{initialData.email}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">WhatsApp:</span>
          <span className="font-semibold text-foreground">{initialData.whatsapp}</span>
        </div>
        <div className="pt-1">
          <span className="text-[11px] text-muted-foreground block mb-1">
            Especialidades Atribuídas:
          </span>
          <div className="flex flex-wrap gap-1">
            {initialData.specialties.map((spec) => (
              <span
                key={spec}
                className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Nome */}
      <div className="space-y-1.5">
        <Label htmlFor="comp-name" required>
          Seu Nome Profissional
        </Label>
        <Input
          id="comp-name"
          disabled={isSubmitting}
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Foto de Perfil */}
      <div className="space-y-1.5">
        <Label htmlFor="comp-avatar">
          URL da Foto de Perfil (Opcional)
        </Label>
        <div className="flex gap-3 items-center">
          <div className="h-11 w-11 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden">
            {avatarUrlPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrlPreview}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <Camera className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <Input
            id="comp-avatar"
            placeholder="https://exemplo.com/minha-foto.jpg"
            disabled={isSubmitting}
            {...register("avatarUrl")}
          />
        </div>
        {errors.avatarUrl && (
          <p className="text-xs text-destructive">{errors.avatarUrl.message}</p>
        )}
      </div>

      {/* Biografia / Apresentação */}
      <div className="space-y-1.5">
        <Label htmlFor="comp-bio">
          Sobre Você / Biografia (Opcional)
        </Label>
        <textarea
          id="comp-bio"
          rows={3}
          placeholder="Ex: Barbeiro com 6 anos de experiência. Especialista em degradê e visagismo masculino..."
          disabled={isSubmitting}
          className="flex w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-amber-500 focus-visible:ring-1 focus-visible:ring-amber-500 disabled:opacity-50"
          {...register("bio")}
        />
        {errors.bio && (
          <p className="text-xs text-destructive">{errors.bio.message}</p>
        )}
      </div>

      {/* Senha de Acesso */}
      <div className="space-y-1.5">
        <Label htmlFor="comp-password" required>
          Criar Senha de Acesso
        </Label>
        <div className="relative">
          <Input
            id="comp-password"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 dígitos (letras e números)"
            disabled={isSubmitting}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Confirmar Senha */}
      <div className="space-y-1.5">
        <Label htmlFor="comp-confirm" required>
          Confirmar Senha
        </Label>
        <div className="relative">
          <Input
            id="comp-confirm"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Repita sua nova senha"
            disabled={isSubmitting}
            className="pr-10"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
            aria-label={showConfirmPassword ? "Ocultar senha" : "Exibir senha"}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold gap-2 text-base"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Finalizando seu cadastro...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Concluir Cadastro & Ativar Perfil
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
