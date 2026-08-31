import * as React from "react"
import Link from "next/link"
import { 
  getAdminStats, 
  getAdminPlans, 
  getAdminFeaturesTree 
} from "@/actions/admin-actions"
import { 
  Users, 
  CreditCard, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Sparkles,
  ShieldCheck
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const [stats, plans, features] = await Promise.all([
    getAdminStats(),
    getAdminPlans(),
    getAdminFeaturesTree(),
  ])

  const totalSubFeatures = features.reduce((acc, f) => acc + (f.children?.length || 0), 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" className="text-[10px] px-2">Painel Master</Badge>
            <span className="text-xs text-muted-foreground">VisualClube SaaS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            Administração da Plataforma
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gerencie o catálogo de recursos do sistema, estruture planos e configure regras de comissionamento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/recursos">
            <Button size="sm" variant="outline" className="text-xs font-bold h-9 rounded-xl">
              <Layers className="h-3.5 w-3.5 mr-1 text-indigo-500" />
              Catálogo de Recursos
            </Button>
          </Link>
          <Link href="/admin/planos">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs h-9 rounded-xl shadow-xs">
              <CreditCard className="h-3.5 w-3.5 mr-1" />
              Gerenciar Planos
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Total de Usuários</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black mt-2">{stats.totalUsers}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-muted-foreground">
            Cadastros gerais na plataforma
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Assinaturas Ativas / Trial</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black mt-2">{stats.totalSubscriptions}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-muted-foreground">
            Espaços com plano em uso
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Planos Cadastrados</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black mt-2">{stats.totalPlans}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-muted-foreground">
            {plans.map((p) => p.name).join(", ")}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Recursos & Módulos</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black mt-2">
              {stats.totalFeatures}
              <span className="text-xs font-normal text-muted-foreground ml-1.5">
                ({features.length} pais, {totalSubFeatures} filhos)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-muted-foreground">
            Disponíveis para vincular aos planos
          </CardContent>
        </Card>
      </div>

      {/* Planos Ativos Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            Planos Vigentes da Plataforma
          </h2>
          <Link href="/admin/planos" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
            <span>Configurar Planos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="border-border/70 bg-card flex flex-col justify-between">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  {plan.badge && (
                    <Badge variant={plan.slug === "pro" ? "gold" : "outline"} className="text-[10px]">
                      {plan.badge}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  {plan.description}
                </CardDescription>
                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-xs text-muted-foreground font-semibold">R$</span>
                  <span className="text-3xl font-black tracking-tight text-foreground">
                    {plan.priceMonthly.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-xs text-muted-foreground">/ mês</span>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-foreground text-[11px]">
                    <span>Recursos Habilitados:</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {plan.featureIds.length} módulos
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Profissionais:</span>
                    <span className="font-semibold text-foreground">
                      {plan.maxProfessionals === -1 ? "Ilimitados" : `Até ${plan.maxProfessionals}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Indicação Multinível:</span>
                    <span className="font-semibold text-foreground">
                      {plan.referralRates ? `${plan.referralRates.length} níveis` : "Nenhum"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
