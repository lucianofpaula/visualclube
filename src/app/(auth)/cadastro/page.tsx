import { Metadata } from "next";
import Link from "next/link";
import { Scissors, ShieldCheck, Zap, Users } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Criar Conta | Visual Club SaaS",
  description: "Cadastre sua barbearia na plataforma mais avançada do mercado.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-zinc-100 hover:opacity-90 transition-opacity"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/20">
            <Scissors className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="font-extrabold tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            VISUAL CLUB
          </span>
        </Link>
        <p className="mt-2 text-sm text-zinc-400">
          A plataforma premium de gestão e escala para barbearias de elite
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <Card className="border-zinc-800 bg-zinc-900/90 shadow-2xl backdrop-blur-md">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-white">
              Comece seu teste gratuito
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Crie seu acesso e configure sua barbearia em menos de 2 minutos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>

        {/* Badges de confiança */}
        <div className="mt-8 grid grid-cols-3 gap-2 text-center text-xs text-zinc-400">
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>Dados 100% Seguros</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Setup Instantâneo</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
            <Users className="h-4 w-4 text-amber-400" />
            <span>Privacidade Total</span>
          </div>
        </div>
      </div>
    </div>
  );
}
