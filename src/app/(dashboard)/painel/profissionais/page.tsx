import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCurrentUser } from "@/actions/auth";
import { getProfessionalsAction } from "@/actions/professionals";
import { getCurrentUserBarbershopAction } from "@/actions/barbershop";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Scissors, UserCheck, Store, ArrowRight, AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { ProfessionalsClientPage } from "@/components/professionals/professionals-client-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const instant = false;

export const metadata = {
  title: "Gestão de Profissionais | Visual Club",
  description: "Cadastre e gerencie a equipe de barbeiros da sua barbearia.",
};

export default async function ProfissionaisPage() {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  const barbershop = await getCurrentUserBarbershopAction();
  const professionals = await getProfessionalsAction();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <SidebarProvider>
      <AppSidebar user={session} />
      <SidebarInset className="bg-background text-foreground min-h-screen">
        {/* Header com Trigger, Separator, Breadcrumb e ThemeToggle */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/90 px-4 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden sm:block">
                  <BreadcrumbLink
                    href="/painel"
                    className="text-muted-foreground hover:text-amber-500 transition-colors flex items-center gap-1.5"
                  >
                    <Scissors className="h-3.5 w-3.5 text-amber-500" />
                    Visual Club
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:block text-muted-foreground/60" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href="/painel"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Painel Administrativo
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-muted-foreground/60" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-semibold flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-amber-500" />
                    Profissionais
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Conteúdo Principal */}
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {!barbershop ? (
            /* Bloqueio: Obriga criação da barbearia antes de cadastrar profissionais */
            <div className="max-w-2xl mx-auto w-full py-12">
              <Card className="border-amber-500/40 shadow-lg text-center">
                <CardHeader className="space-y-3 pb-4">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center">
                    <Store className="h-8 w-8" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 mx-auto rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Configuração Prévia Necessária
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    Cadastre sua Barbearia Primeiro
                  </CardTitle>
                  <CardDescription className="text-sm max-w-md mx-auto text-muted-foreground">
                    Para cadastrar barbeiros, gerenciar comissões e enviar links de convite via WhatsApp, sua barbearia precisa estar criada no sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border text-left text-xs space-y-2 text-muted-foreground">
                    <p className="font-semibold text-foreground">
                      Por que este passo é obrigatório?
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Cada profissional contratado fica vinculado à unidade da sua barbearia.</li>
                      <li>Os links de convite enviados via WhatsApp levam a marca e o nome do seu estabelecimento.</li>
                      <li>A agenda e os horários dos profissionais dependem dos dias de funcionamento da barbearia.</li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/painel/barbearia"
                      className={buttonVariants({
                        size: "lg",
                        className: "w-full bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm gap-2 shadow-md shadow-amber-500/20",
                      })}
                    >
                      <Store className="h-4 w-4" />
                      Criar Minha Barbearia Agora
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Barbearia já criada: exibe gestão de profissionais normalmente */
            <ProfessionalsClientPage
              initialProfessionals={professionals}
              appUrl={appUrl}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
