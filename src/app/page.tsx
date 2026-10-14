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

export const metadata = {
  title: "Visual Club | SaaS Premium para Barbearias de Alta Performance",
  description:
    "Gestão operacional, agendamento online, comissões automáticas e programa de indicações para barbearias e profissionais.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500/30 selection:text-amber-300">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Header / Nav */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/20">
              <Scissors className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                VISUAL CLUB
              </span>
              <span className="text-[10px] tracking-widest uppercase text-amber-400/90 font-semibold -mt-1">
                Barbershop OS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#recursos" className="hover:text-white transition-colors">
              Recursos
            </a>
            <a href="#diferenciais" className="hover:text-white transition-colors">
              Diferenciais
            </a>
            <a href="#planos" className="hover:text-white transition-colors">
              Planos
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button size="sm" className="font-semibold shadow-md shadow-amber-500/20">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-amber-400 mb-8 backdrop-blur-sm animate-in fade-in">
            <Sparkles className="h-4 w-4" />
            A revolução na gestão de barbearias e profissionais
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            O sistema definitivo para sua barbearia{" "}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              faturar mais e rodar no piloto automático.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Centralize agendamentos online, controle financeiro, rateio de comissões por barbeiro e programas de indicação em uma única plataforma premium e exclusiva para seu negócio.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/cadastro" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base gap-2 px-8 h-13 shadow-xl shadow-amber-500/25">
                Criar Minha Conta Grátis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base h-13 px-8 text-zinc-300"
              >
                Acessar Demonstração
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Sem fidelidade obrigatória</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-amber-400" />
              <span>Compatível com Celular & PWA</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>Configuração em 2 minutos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="recursos" className="py-20 border-t border-zinc-900 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-3">
              Módulos Completos
            </h2>
            <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Tudo o que sua barbearia precisa para dominar a concorrência
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 hover:border-zinc-700 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Agenda Inteligente sem Furos
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Agendamento 24h pelos próprios clientes, com bloqueios automáticos, prevenção de conflitos e horários flexíveis por barbeiro.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 hover:border-zinc-700 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Controle Financeiro & Comissões
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Caixa diário, formas de pagamento, cálculo automático da comissão de cada barbeiro e extrato com transparência total.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 hover:border-zinc-700 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Fidelidade & Indicações
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Transforme clientes em promotores da sua barbearia com sistema de pontos, recompensas e comissionamento por indicações.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas / Números */}
      <section id="diferenciais" className="py-20 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <TrendingUp className="h-6 w-6 text-amber-400 mx-auto mb-3" />
              <div className="text-3xl font-extrabold text-white">+38%</div>
              <p className="text-xs text-zinc-400 mt-1">Faturamento médio</p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <Clock className="h-6 w-6 text-amber-400 mx-auto mb-3" />
              <div className="text-3xl font-extrabold text-white">-85%</div>
              <p className="text-xs text-zinc-400 mt-1">Tempo gasto em mensagens</p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <Users className="h-6 w-6 text-amber-400 mx-auto mb-3" />
              <div className="text-3xl font-extrabold text-white">100%</div>
              <p className="text-xs text-zinc-400 mt-1">Controle & Privacidade</p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <ShieldCheck className="h-6 w-6 text-amber-400 mx-auto mb-3" />
              <div className="text-3xl font-extrabold text-white">99.9%</div>
              <p className="text-xs text-zinc-400 mt-1">Disponibilidade de sistema</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 relative overflow-hidden border-t border-zinc-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-10 sm:p-16 shadow-2xl relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Pronto para elevar o nível da sua barbearia?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-xl mx-auto">
              Crie sua conta no Visual Club agora mesmo e tenha controle total do seu negócio na palma da mão.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/cadastro">
                <Button size="lg" className="h-13 px-8 text-base font-semibold shadow-lg shadow-amber-500/20">
                  Criar Minha Conta Grátis
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950">
              <Scissors className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm tracking-wider text-white">
              VISUAL CLUB
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            © 2026 Visual Club SaaS. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-xs text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
