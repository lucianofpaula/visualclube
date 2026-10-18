"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { loginSchema, type LoginInput } from "@/validations/auth";
import { loginUserAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setServerSuccess(null);

    const result = await loginUserAction(data);

    if (!result.success) {
      setServerError(result.message || "Credenciais inválidas.");
      return;
    }

    setServerSuccess("Login efetuado com sucesso! Entrando...");
    setTimeout(() => {
      router.push("/painel");
      router.refresh();
    }, 1000);
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

      <div className="space-y-1.5">
        <Label htmlFor="email" required>
          E-mail
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

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" required>
            Senha
          </Label>
          <a
            href="#"
            className="text-xs text-zinc-400 hover:text-amber-400 transition-colors"
          >
            Esqueceu a senha?
          </a>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Sua senha secreta"
            autoComplete="current-password"
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

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 text-sm sm:text-base font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 transition-all rounded-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Autenticando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Entrar na Plataforma
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </span>
          )}
        </Button>
      </div>

      <div className="text-center pt-2">
        <span className="text-sm text-zinc-400">
          Ainda não tem conta?{" "}
          <Link
            href="/cadastro"
            className="text-amber-400 hover:text-amber-300 font-medium underline-offset-4 hover:underline"
          >
            Cadastre sua barbearia
          </Link>
        </span>
      </div>
    </form>
  );
}
