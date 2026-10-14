import { Metadata } from "next";
import Link from "next/link";
import { Scissors } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Entrar | Visual Club SaaS",
  description: "Acesse o painel administrativo da sua barbearia.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

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
          Bem-vindo de volta ao seu centro de comando
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="border-zinc-800 bg-zinc-900/90 shadow-2xl backdrop-blur-md">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-white">
              Acessar Painel
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Digite suas credenciais de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
