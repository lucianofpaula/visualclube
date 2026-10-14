import Link from "next/link";
import {
  Scissors,
  Calendar,
  DollarSign,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

import { getCurrentUser } from "@/actions/auth";
import { getCurrentUserBarbershopAction } from "@/actions/barbershop";
import { LandingUserMenu } from "@/components/landing/landing-user-menu";

export const instant = false;

export const metadata = {
  title: "Visual Club | SaaS Premium para Barbearias de Alta Performance",
  description:
    "Gestão operacional, agendamento online, comissões automáticas e programa de indicações para barbearias e profissionais.",
};

export default async function HomePage() {
  const session = await getCurrentUser();
  const barbershop = session ? await getCurrentUserBarbershopAction() : null;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors selection:bg-amber-500/30 selection:text-amber-500">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Header / Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/20">
              <Scissors className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-wider text-foreground">
                VISUAL CLUB
              </span>
              <span className="text-[10px] tracking-widest uppercase text-amber-500 dark:text-amber-400 font-semibold -mt-1">
                Barbershop OS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#recursos" className="hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#diferenciais" className="hover:text-foreground transition-colors">
              Diferenciais
            </a>
            <a href="#planos" className="hover:text-foreground transition-colors">
              Planos
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session ? (
              <LandingUserMenu user={session} barbershop={barbershop} />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button size="sm" className="font-semibold shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 text-black">
                    Começar Grátis
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400 mb-8 backdrop-blur-sm animate-in fade-in">
            <Sparkles className="h-4 w-4" />
            A revolução na gestão de barbearias e profissionais
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
            O sistema definitivo para sua barbearia{" "}
            <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              faturar mais e rodar no piloto automático.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Centralize agendamentos online, controle financeiro, rateio de comissões por barbeiro e programas de indicação em uma única plataforma premium e exclusiva para seu negócio.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <>
                <Link href="/painel" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base gap-2 px-8 h-13 shadow-xl shadow-amber-500/25 bg-amber-500 hover:bg-amber-600 text-black font-bold">
                    Acessar Meu Painel
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={barbershop ? `/b/${barbershop.subdomain}` : "/painel/barbearia"}
                  target={barbershop ? "_blank" : "_self"}
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-base h-13 px-8 border-border text-foreground hover:bg-muted"
                  >
                    Acessar Meu Site
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/cadastro" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base gap-2 px-8 h-13 shadow-xl shadow-amber-500/25 bg-amber-500 hover:bg-amber-600 text-black font-bold">
                    Criar Minha Conta Grátis
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-base h-13 px-8 border-border text-foreground hover:bg-muted"
                  >
                    Acessar Demonstração
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Sem fidelidade obrigatória</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-amber-500" />
              <span>Compatível com Celular & PWA</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>Configuração em 2 minutos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="recursos" className="py-20 border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-amber-500 dark:text-amber-400 font-bold mb-3">
              Módulos Completos
            </h2>
            <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Tudo o que sua barbearia precisa para dominar a concorrência
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="rounded-2xl border border-border bg-card p-8 hover:border-amber-500/40 hover:shadow-lg transition-all group">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">
                Agenda Inteligente sem Furos
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Agendamento 24h pelos próprios clientes, com bloqueios automáticos, prevenção de conflitos e horários flexíveis por barbeiro.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-border bg-card p-8 hover:border-amber-500/40 hover:shadow-lg transition-all group">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">
                Controle Financeiro & Comissões
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Caixa diário, formas de pagamento, cálculo automático da comissão de cada barbeiro e extrato com transparência total.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-border bg-card p-8 hover:border-amber-500/40 hover:shadow-lg transition-all group">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">
                Fidelidade & Indicações
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Transforme clientes em promotores da sua barbearia com sistema de pontos, recompensas e comissionamento por indicações.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas / Números */}
      <section id="diferenciais" className="py-20 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 rounded-xl bg-card border border-border shadow-xs">
              <TrendingUp className="h-6 w-6 text-amber-500 mx-auto mb-3" />
              <div className="text-3xl font-extrabold text-foreground">+38%</div>
              <p className="text-xs text-muted-foreground mt-1">Faturamento médio</p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border shadow-xs">
              <Clock className="h-6 w-6 text-amber-500 mx-auto mb-3" />
              <div className="text-3xl font-extrabold text-foreground">-85%</div>
              <p className="text-xs text-muted-foreground mt-1">Tempo gasto em mensagens</p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border shadow-xs">
              <Users className="h-6 w-6 text-amber-500 mx-auto mb-3" />
              <div className="text-3xl font-extrabold text-foreground">100%</div>
              <p className="text-xs text-muted-foreground mt-1">Controle & Privacidade</p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border shadow-xs">
              <ShieldCheck className="h-6 w-6 text-amber-500 mx-auto mb-3" />
              <div className="text-3xl font-extrabold text-foreground">99.9%</div>
              <p className="text-xs text-muted-foreground mt-1">Disponibilidade de sistema</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 relative overflow-hidden border-t border-border bg-muted/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl border border-border bg-card p-10 sm:p-16 shadow-xl relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Pronto para elevar o nível da sua barbearia?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Crie sua conta no Visual Club agora mesmo e tenha controle total do seu negócio na palma da mão.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/cadastro">
                <Button size="lg" className="h-13 px-8 text-base font-semibold shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 text-black">
                  Criar Minha Conta Grátis
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950">
              <Scissors className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm tracking-wider text-foreground">
              VISUAL CLUB
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Visual Club SaaS. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Termos</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
