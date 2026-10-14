"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/validations/auth";
import { registerUserAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      whatsapp: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Formatação automática do WhatsApp para o padrão brasileiro (XX) XXXXX-XXXX
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

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    setServerSuccess(null);

    const result = await registerUserAction(data);

    if (!result.success) {
      setServerError(result.message || "Erro ao processar o cadastro.");
      return;
    }

    setServerSuccess("Conta criada com sucesso! Redirecionando para o painel...");
    setTimeout(() => {
      router.push("/painel");
      router.refresh();
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-300 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <span>{serverError}</span>
        </div>
      )}

      {serverSuccess && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-4 text-sm text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span>{serverSuccess}</span>
        </div>
      )}

      {/* Nome Completo */}
      <div className="space-y-1.5">
        <Label htmlFor="name" required>
          Nome Completo
        </Label>
        <Input
          id="name"
          placeholder="Ex: Carlos Albuquerque"
          autoComplete="name"
          disabled={isSubmitting}
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* E-mail */}
      <div className="space-y-1.5">
        <Label htmlFor="email" required>
          E-mail Profissional
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      {/* WhatsApp */}
      <div className="space-y-1.5">
        <Label htmlFor="whatsapp" required>
          WhatsApp com DDD
        </Label>
        <Input
          id="whatsapp"
          placeholder="(11) 99999-9999"
          autoComplete="tel"
          disabled={isSubmitting}
          aria-invalid={!!errors.whatsapp}
          {...register("whatsapp")}
          onChange={handleWhatsappChange}
        />
        {errors.whatsapp && (
          <p className="text-xs text-red-400">{errors.whatsapp.message}</p>
        )}
      </div>

      {/* Senha */}
      <div className="space-y-1.5">
        <Label htmlFor="password" required>
          Senha de Acesso
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 dígitos (letras e números)"
            autoComplete="new-password"
            disabled={isSubmitting}
            aria-invalid={!!errors.password}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
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
          <p className="text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      {/* Confirmar Senha */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" required>
          Confirmar Senha
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Repita sua senha"
            autoComplete="new-password"
            disabled={isSubmitting}
            aria-invalid={!!errors.confirmPassword}
            className="pr-10"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
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
          <p className="text-xs text-red-400">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full text-base font-semibold"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Criando sua conta...
            </span>
          ) : (
            "Criar Minha Conta Grátis"
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-zinc-500 pt-2">
        Ao se cadastrar, você concorda com nossos{" "}
        <span className="text-zinc-400 underline">Termos de Uso</span> e{" "}
        <span className="text-zinc-400 underline">Política de Privacidade</span>.
      </p>

      <div className="text-center pt-2">
        <span className="text-sm text-zinc-400">
          Já possui uma conta?{" "}
          <Link
            href="/login"
            className="text-amber-400 hover:text-amber-300 font-medium underline-offset-4 hover:underline"
          >
            Acessar o Painel
          </Link>
        </span>
      </div>
    </form>
  );
}
