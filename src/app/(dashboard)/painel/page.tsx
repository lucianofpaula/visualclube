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
import { getCurrentUserBarbershopAction } from "@/actions/barbershop";
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
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
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

  const barbershop = await getCurrentUserBarbershopAction();
  const professionalCount = barbershop?.professionals?.length || 0;

  return (
    <SidebarProvider>
      <AppSidebar user={session} barbershop={barbershop} />
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
                  <BreadcrumbPage className="text-foreground font-semibold flex items-center gap-1.5">
                    <Store className="h-4 w-4 text-amber-500" />
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

        {/* Conteúdo Principal do Dashboard */}
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full max-w-7xl">
          {/* Alerta de Onboarding: Se a barbearia ainda não foi criada */}
          {!barbershop && (
            <div className="p-4 sm:p-5 rounded-sm border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in-50">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-sm bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Configure sua barbearia para liberar todos os recursos
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Para cadastrar profissionais, ativar seu subdomínio exclusivo e receber agendamentos, complete o perfil do seu negócio.
                  </p>
                </div>
              </div>

              <Link
                href="/painel/barbearia"
                className={buttonVariants({
                  className: "bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs gap-2 shrink-0 shadow-sm rounded-sm",
                })}
              >
                <Store className="h-4 w-4" />
                Configurar Barbearia Agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Boas-Vindas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                Acesso Ativo • {session.role}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {barbershop ? barbershop.name : `Bem-vindo ao Visual Club, ${session.name}! 👋`}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {barbershop
                  ? `Central de comando da sua unidade. Subdomínio ativo em ${barbershop.subdomain}.visualclube.com.br`
                  : "Aqui é a central de comando da sua barbearia. Siga as instruções abaixo para ativar sua unidade."}
              </p>
            </div>

            {barbershop && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/b/${barbershop.subdomain}`}
                  target="_blank"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "gap-1.5 text-xs font-medium",
                  })}
                >
                  <Globe className="h-3.5 w-3.5 text-amber-500" />
                  Ver Página Pública
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </div>
            )}
          </div>

          {/* Cards de Métricas Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Métrica 1 */}
            <Card className="hover:border-primary/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Agendamentos Hoje
                </CardTitle>
                <Calendar className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-foreground">0</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Nenhum corte agendado ainda
                </p>
              </CardContent>
            </Card>

            {/* Métrica 2 */}
            <Card className="hover:border-primary/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Faturamento Previsto
                </CardTitle>
                <DollarSign className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-foreground">R$ 0,00</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Caixa diário pronto para abertura
                </p>
              </CardContent>
            </Card>

            {/* Métrica 3 */}
            <Card className="hover:border-primary/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Barbeiros na Equipe
                </CardTitle>
                <Users className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-foreground">
                  {professionalCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {professionalCount === 0
                    ? "Nenhum profissional vinculado"
                    : `${professionalCount} profissional(is) cadastrado(s)`}
                </p>
              </CardContent>
            </Card>

            {/* Métrica 4 */}
            <Card className="hover:border-primary/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Status da Unidade
                </CardTitle>
                <Store className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                {barbershop ? (
                  <>
                    <div className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Ativa & Operando
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                      {barbershop.subdomain}.visualclube
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-semibold text-amber-500 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      Pendente de Cadastro
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Etapa 2 Obrigatória
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Seção Central: Configuração da Barbearia e Atalhos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card Grande de Boas-Vindas e Próximo Passo */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                  <Store className="h-4 w-4" />
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Plano de Implantação
                  </span>
                </div>
                <CardTitle className="text-base sm:text-lg font-semibold">
                  {barbershop
                    ? "Próximos passos para acelerar sua barbearia"
                    : "Prepare sua barbearia para receber agendamentos"}
                </CardTitle>
                <CardDescription>
                  Siga os passos abaixo para colocar sua operação 100% no ar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Passo 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-sm bg-muted/40 border border-emerald-500/20">
                    <div className="h-7 w-7 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0 font-bold text-xs">
                      <CheckCircle2 className="h-4 w-4" />
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

                  {/* Passo 2 */}
                  <div
                    className={`flex items-start gap-3 p-3 rounded-sm border transition-colors ${
                      barbershop
                        ? "bg-muted/40 border-emerald-500/20"
                        : "bg-amber-500/5 border-amber-500/30"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-sm flex items-center justify-center shrink-0 font-bold text-xs ${
                        barbershop
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500"
                          : "bg-amber-500/10 border border-amber-500/30 text-amber-500"
                      }`}
                    >
                      {barbershop ? <CheckCircle2 className="h-4 w-4" /> : "2"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">
                          {barbershop
                            ? `Barbearia Cadastrada (${barbershop.name})`
                            : "Cadastrar Perfil da Barbearia (Obrigatório)"}
                        </h4>
                        {barbershop && (
                          <Link
                            href="/painel/barbearia"
                            className="text-xs text-amber-500 hover:underline font-medium"
                          >
                            Editar Dados
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {barbershop
                          ? `Endereço: ${barbershop.address || ""}, ${barbershop.number || ""} • Subdomínio: ${barbershop.subdomain}`
                          : "Defina o nome da barbearia, subdomínio wildcard, endereço com CEP e grade de horários."}
                      </p>
                    </div>
                  </div>

                  {/* Passo 3 */}
                  <div
                    className={`flex items-start gap-3 p-3 rounded-sm border ${
                      professionalCount > 0
                        ? "bg-muted/40 border-emerald-500/20"
                        : "bg-muted/40 border-border"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-sm flex items-center justify-center shrink-0 font-bold text-xs ${
                        professionalCount > 0
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500"
                          : "bg-muted border border-border text-muted-foreground"
                      }`}
                    >
                      {professionalCount > 0 ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        "3"
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">
                          Adicionar Equipe de Profissionais
                        </h4>
                        {barbershop && (
                          <Link
                            href="/painel/profissionais"
                            className="text-xs text-amber-500 hover:underline font-medium"
                          >
                            Gerenciar
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {professionalCount > 0
                          ? `${professionalCount} profissional(is) cadastrado(s) na equipe.`
                          : "Cadastrar profissionais e enviar convite de acesso via WhatsApp."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ação rápida contextual */}
                <div className="pt-2">
                  {!barbershop ? (
                    <Link
                      href="/painel/barbearia"
                      className={buttonVariants({
                        className: "w-full justify-center bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm gap-2",
                      })}
                    >
                      <Store className="h-4 w-4" />
                      Cadastrar Minha Barbearia Agora (Passo 2)
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : professionalCount === 0 ? (
                    <Link
                      href="/painel/profissionais"
                      className={buttonVariants({
                        className: "w-full justify-center bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm gap-2",
                      })}
                    >
                      <Users className="h-4 w-4" />
                      Cadastrar Primeiro Barbeiro da Equipe (Passo 3)
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <Link
                      href={`/b/${barbershop.subdomain}`}
                      target="_blank"
                      className={buttonVariants({
                        variant: "outline",
                        className: "w-full justify-center text-xs gap-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10",
                      })}
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Barbearia 100% Configurada • Visualizar Site de Agendamento
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )}
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
                    Links Rápidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link
                    href="/painel/barbearia"
                    className="flex items-center justify-between p-2.5 rounded-sm bg-muted/40 border border-border hover:bg-muted text-xs text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-amber-500" />
                      Configurar Barbearia
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>

                  <Link
                    href="/painel/profissionais"
                    className="flex items-center justify-between p-2.5 rounded-sm bg-muted/40 border border-border hover:bg-muted text-xs text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-amber-500" />
                      Gerenciar Profissionais
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>

                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center justify-between p-2.5 rounded-sm bg-muted/40 border border-border hover:bg-muted text-xs text-foreground transition-colors"
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
