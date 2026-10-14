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
import { redirect } from "next/navigation";
import {
  Calendar,
  DollarSign,
  Users,
  Store,
  Sparkles,
  ArrowUpRight,
  Clock,
  Shield,
  Scissors,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export const instant = false;

export const metadata = {
  title: "Painel Geral | Visual Club",
  description: "Painel administrativo do Visual Club Barbearias",
};

export default async function PainelPage() {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar user={session} />
      <SidebarInset className="bg-background text-foreground min-h-screen">
        {/* Header com Trigger, Separator, Breadcrumb e ThemeToggle */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/90 px-4 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4"
            />
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
                  <BreadcrumbPage className="text-foreground font-semibold">
                    Visão Geral
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Conteúdo Principal do Painel */}
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <div className="relative z-10 max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500 dark:text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
                Acesso Ativo • Perfil {session.role}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Bem-vindo ao Visual Club, {session.name}! 👋
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Aqui é a central de comando da sua barbearia. Acompanhe a agenda, controle faturamento e gerencie atendimentos em tempo real.
              </p>
            </div>
          </div>

          {/* Cards de Métricas Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Métrica 1 */}
            <Card className="hover:border-primary/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Agendamentos Hoje
                </CardTitle>
                <Calendar className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">0</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Nenhum corte agendado ainda
                </p>
              </CardContent>
            </Card>

            {/* Métrica 2 */}
            <Card className="hover:border-primary/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Faturamento Previsto
                </CardTitle>
                <DollarSign className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">R$ 0,00</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Caixa diário pronto para abertura
                </p>
              </CardContent>
            </Card>

            {/* Métrica 3 */}
            <Card className="hover:border-primary/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Barbeiros na Equipe
                </CardTitle>
                <Users className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">1</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {session.name} (Administrador)
                </p>
              </CardContent>
            </Card>

            {/* Métrica 4 */}
            <Card className="hover:border-primary/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Status da Unidade
                </CardTitle>
                <Store className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold text-amber-500 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  Pronta para Configuração
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Etapa 2: Cadastro da Barbearia
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Seção Central: Configuração da Barbearia e Atalhos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card Grande de Boas-Vindas e Próximo Passo */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2 text-amber-500 mb-1">
                  <Store className="h-5 w-5" />
                  <span className="text-xs uppercase font-semibold tracking-wider">
                    Configuração Inicial
                  </span>
                </div>
                <CardTitle className="text-xl">
                  Prepare sua barbearia para receber agendamentos
                </CardTitle>
                <CardDescription>
                  Siga os próximos passos para colocar sua operação 100% no ar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                    <div className="h-7 w-7 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 font-bold text-xs">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        Conta Criada & Autenticada
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Seu login seguro com credenciais de administrador já está ativo.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                    <div className="h-7 w-7 rounded-md bg-muted border border-border text-muted-foreground flex items-center justify-center shrink-0 font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        Cadastrar Perfil da Barbearia (Próxima Etapa)
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Definir nome do estabelecimento, logotipo, endereço e horários de funcionamento.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                    <div className="h-7 w-7 rounded-md bg-muted border border-border text-muted-foreground flex items-center justify-center shrink-0 font-bold text-xs">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        Adicionar Serviços & Barbeiros
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Cadastrar cortes, barba, combos, preços e vincular os profissionais da casa.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    disabled
                    variant="outline"
                    className="w-full justify-center border-dashed border-amber-500/40 text-amber-500/80 cursor-not-allowed"
                  >
                    Aguardando liberação da Etapa 2 para criar o estabelecimento
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Painel Lateral: Atalhos Rápidos e Segurança */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs uppercase font-semibold tracking-wider">
                      Sua Sessão
                    </span>
                  </div>
                  <CardTitle className="text-base">
                    Dados do Usuário Ativo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Nome:</span>
                    <span className="font-medium text-foreground">{session.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">E-mail:</span>
                    <span className="font-medium text-foreground truncate max-w-[160px]">
                      {session.email}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Função:</span>
                    <span className="font-mono text-amber-500 font-bold">
                      {session.role}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Segurança:</span>
                    <span className="text-emerald-500 font-medium">Sessão Segura JWT</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Links Úteis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border hover:bg-muted text-xs text-foreground transition-colors"
                  >
                    <span>Ver Landing Page Pública</span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
