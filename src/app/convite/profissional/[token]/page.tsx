import { Metadata } from "next";
import { getProfessionalByInviteToken } from "@/actions/professionals";
import { CompleteInviteForm } from "@/components/professionals/complete-invite-form";
import { Scissors, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const instant = false;

export const metadata: Metadata = {
  title: "Concluir Cadastro de Profissional | Visual Club",
  description: "Complete seu perfil e ative sua conta profissional.",
};

export default async function ConviteProfissionalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const inviteCheck = await getProfessionalByInviteToken(token);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Header com Marca */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950 shadow-md">
            <Scissors className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="font-extrabold tracking-wider">
            VISUAL CLUB
          </span>
        </Link>
        <p className="mt-2 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          Equipe de Barbearia • Ativação de Perfil
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl">
          {!inviteCheck.valid || !inviteCheck.data ? (
            /* Convite Inválido ou Expirado */
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
                <AlertCircle className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Link de Convite Não Disponível
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {inviteCheck.message ||
                  "Este link de convite é inválido ou já expirou. Solicite um novo link à administração da sua barbearia."}
              </p>
              <div className="pt-2">
                <Link href="/">
                  <Button variant="outline">Voltar para o Início</Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Formulário para o Profissional Concluir Cadastro */
            <div className="space-y-6">
              <div className="space-y-1 text-center">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Complete seu Cadastro
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Defina sua senha e personalize seu perfil para começar a atender.
                </p>
              </div>

              <CompleteInviteForm
                token={token}
                initialData={inviteCheck.data}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
