import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface SeedFeatureItem {
  code: string
  name: string
  description?: string
  icon?: string
  menuPath?: string
  order: number
  subFeatures?: Array<{
    code: string
    name: string
    description?: string
    menuPath?: string
    order: number
  }>
}

const systemFeatures: SeedFeatureItem[] = [
  {
    code: "meunegocio",
    name: "Meu Negócio",
    description: "Website premium, personalização do link da bio e configurações da barbearia/salão.",
    icon: "Store",
    menuPath: "/app/meu-negocio",
    order: 0,
    subFeatures: [
      { code: "web-site", name: "Website Premium", menuPath: "/app/website", order: 1 },
      { code: "meunegocio.configuracao", name: "Configurações do Espaço", menuPath: "/app/configuracoes", order: 2 },
    ],
  },
  {
    code: "clientes",
    name: "Clientes & CRM",
    description: "Base de clientes, histórico de visitas, rede de indicações e cadastro completo.",
    icon: "Users",
    menuPath: "/app/clientes",
    order: 1,
  },
  {
    code: "agenda",
    name: "Agenda & Horários",
    description: "Controle de horários marcados, profissionais e grade de atendimento.",
    icon: "Calendar",
    menuPath: "/app/agenda",
    order: 2,
    subFeatures: [
      { code: "agenda.grade_diaria", name: "Grade de Horários & Atendimentos", menuPath: "/app/agenda", order: 1 },
      { code: "agenda.configuracoes", name: "Configurações da Agenda & Feriados", menuPath: "/app/agenda/configuracoes", order: 2 },
      { code: "agenda.agendamento_online", name: "Página de Agendamento Online", menuPath: "/app/website", order: 3 },
    ],
  },
  {
    code: "comandas",
    name: "PDV & Comandas",
    description: "Abertura, lançamento de serviços, consumo do bar e fechamento rápido.",
    icon: "Receipt",
    menuPath: "/app/comandas",
    order: 3,
    subFeatures: [
      { code: "comandas.abertura", name: "Abertura de Comanda e Ficha", menuPath: "/app/comandas", order: 1 },
      { code: "comandas.produtos_bar", name: "Venda de Produtos e Bar na Comanda", menuPath: "/app/comandas", order: 2 },
      { code: "comandas.fechamento_split", name: "Fechamento com Split de Pagamentos", menuPath: "/app/comandas", order: 3 },
    ],
  },
  {
    code: "produtos",
    name: "Produtos & Estoque",
    description: "Cadastro de produtos, preços de custo/venda, margens e controle de estoque.",
    icon: "Package",
    menuPath: "/app/produtos",
    order: 4,
    subFeatures: [
      { code: "produtos.cadastro", name: "Cadastro de Produtos e Custos", menuPath: "/app/produtos", order: 1 },
      { code: "produtos.estoque", name: "Controle e Movimentação de Estoque", menuPath: "/app/produtos", order: 2 },
      { code: "produtos.margens", name: "Relatório de Margens e Lucratividade", menuPath: "/app/produtos", order: 3 },
    ],
  },
  {
    code: "servicos",
    name: "Serviços & Catálogo",
    description: "Cadastro de procedimentos, preços, duração e comissões.",
    icon: "Scissors",
    menuPath: "/app/servicos",
    order: 5,
    subFeatures: [
      { code: "servicos.cadastro", name: "Cadastro de Serviços e Preços", menuPath: "/app/servicos", order: 1 },
      { code: "servicos.categorias", name: "Categorização de Serviços", menuPath: "/app/servicos", order: 2 },
      { code: "servicos.comissoes_customizadas", name: "Comissão Diferenciada por Serviço", menuPath: "/app/servicos", order: 3 },
    ],
  },
  {
    code: "equipe",
    name: "Equipe & Profissionais",
    description: "Gestão de profissionais parceiros, percentual de repasse e horários.",
    icon: "Users",
    menuPath: "/app/equipe",
    order: 6,
    subFeatures: [
      { code: "equipe.cadastro_profissionais", name: "Cadastro de Profissionais", menuPath: "/app/equipe", order: 1 },
      { code: "equipe.metas_comissao", name: "Metas e Percentual de Repasse", menuPath: "/app/equipe", order: 2 },
    ],
  },
  {
    code: "financeiro",
    name: "Financeiro",
    description: "Fluxo de caixa diário, contas bancárias, meios de pagamento, repasses e faturamento.",
    icon: "Wallet",
    menuPath: "/app/financeiro",
    order: 7,
    subFeatures: [
      { code: "financeiro.fluxo_caixa", name: "Fluxo de Caixa & Extrato", menuPath: "/app/financeiro", order: 1 },
      { code: "financeiro.contas", name: "Contas & Carteiras", menuPath: "/app/financeiro/contas", order: 2 },
      { code: "financeiro.meios_pagamento", name: "Meios de Pagamento", menuPath: "/app/financeiro/meios-de-pagamento", order: 3 },
      { code: "financeiro.relatorio_comissoes", name: "Relatório Detalhado de Comissões", menuPath: "/app/financeiro", order: 4 },
      { code: "financeiro.dre_avancado", name: "DRE Gerencial e Faturamento Avançado", menuPath: "/app/financeiro", order: 5 },
    ],
  },
  {
    code: "clube_vip",
    name: "Clube de Assinaturas",
    description: "Criação de planos de assinatura mensal e comissionamento multinível de indicações.",
    icon: "Sparkles",
    menuPath: "/app/clube",
    order: 8,
    subFeatures: [
      { code: "clube_vip.planos", name: "Planos do Clube", menuPath: "/app/clube", order: 1 },
      { code: "clube_vip.configuracao", name: "Configuração do Clube", menuPath: "/app/clube/configuracoes", order: 2 },
    ],
  },
  {
    code: "robo_whatsapp",
    name: "Robô de WhatsApp",
    description: "Lembretes automáticos e confirmação de presença no WhatsApp do cliente.",
    icon: "MessageSquare",
    menuPath: "/app/robo-whatsapp",
    order: 9,
    subFeatures: [
      { code: "robo_whatsapp.lembrete_automatico", name: "Lembrete Automático 2h Antes", menuPath: "/app/robo-whatsapp", order: 1 },
      { code: "robo_whatsapp.confirmacao_presenca", name: "Confirmação de Presença via Bot", menuPath: "/app/robo-whatsapp", order: 2 },
    ],
  },
  {
    code: "multi_unidades",
    name: "Multi-Unidades / Filiais",
    description: "Gestão centralizada de múltiplas unidades ou filiais do negócio.",
    icon: "Building2",
    menuPath: "/app/multi-unidades",
    order: 10,
    subFeatures: [
      { code: "multi_unidades.gestao_filiais", name: "Cadastro e Gestão de Filiais", menuPath: "/app/multi-unidades", order: 1 },
      { code: "multi_unidades.relatorio_consolidado", name: "Relatórios Consolidados de Toda a Rede", menuPath: "/app/multi-unidades", order: 2 },
    ],
  },
]

async function main() {
  console.log("🌱 Iniciando o seed do Catálogo de Recursos (PlatformFeature)...")

  const featureMap = new Map<string, string>() // code -> id

  for (const item of systemFeatures) {
    const parent = await prisma.platformFeature.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        description: item.description,
        icon: item.icon,
        menuPath: item.menuPath,
        order: item.order,
        isActive: true,
      },
      create: {
        code: item.code,
        name: item.name,
        description: item.description,
        icon: item.icon,
        menuPath: item.menuPath,
        order: item.order,
        isActive: true,
      },
    })

    featureMap.set(parent.code, parent.id)
    console.log(`📁 Recurso Pai: [${parent.name}] (${parent.code})`)

    if (item.subFeatures) {
      for (const sub of item.subFeatures) {
        const child = await prisma.platformFeature.upsert({
          where: { code: sub.code },
          update: {
            name: sub.name,
            description: sub.description,
            menuPath: sub.menuPath,
            order: sub.order,
            parentId: parent.id,
            isActive: true,
          },
          create: {
            code: sub.code,
            name: sub.name,
            description: sub.description,
            menuPath: sub.menuPath,
            order: sub.order,
            parentId: parent.id,
            isActive: true,
          },
        })
        featureMap.set(child.code, child.id)
        console.log(`   ↳ Sub-recurso: [${child.name}] (${child.code})`)
      }
    }
  }

  // Também registra no featureMap quaisquer outras features que já existem no banco
  const existingInDb = await prisma.platformFeature.findMany({ where: { isActive: true } })
  for (const f of existingInDb) {
    if (!featureMap.has(f.code)) {
      featureMap.set(f.code, f.id)
    }
  }

  console.log("\n🔗 Vinculando Recursos aos Planos SaaS...")

  // Start / Iniciante: Meu Negócio, Clientes, Agenda, Comandas, Produtos, Serviços, Equipe, Financeiro (Básico)
  const startCodes = [
    "meunegocio", "web-site", "meunegocio.configuracao",
    "clientes",
    "agenda", "agenda.grade_diaria", "agenda.agendamento_online", "agenda.bloqueio_horarios",
    "comandas", "comandas.abertura", "comandas.produtos_bar", "comandas.fechamento_split",
    "produtos", "produtos.cadastro", "produtos.estoque", "produtos.margens",
    "servicos", "servicos.cadastro", "servicos.categorias",
    "equipe", "equipe.cadastro_profissionais",
    "financeiro", "financeiro.fluxo_caixa", "financeiro.contas", "financeiro.meios_pagamento",
  ]
  const startFeatureIds = startCodes.map((c) => featureMap.get(c)).filter(Boolean) as string[]

  // Pro Features: Start + Comissões Customizadas, Metas, Relatório Comissões, Clube VIP, Robô WhatsApp
  const proCodes = [
    ...startCodes,
    "servicos.comissoes_customizadas",
    "equipe.metas_comissao",
    "financeiro.relatorio_comissoes",
    "clube_vip", "clube_vip.planos", "clube_vip.configuracao",
    "robo_whatsapp", "robo_whatsapp.lembrete_automatico", "robo_whatsapp.confirmacao_presenca",
  ]
  const proFeatureIds = proCodes.map((c) => featureMap.get(c)).filter(Boolean) as string[]

  // Elite Features: Todos os recursos e sub-recursos ativos do banco
  const allFeatureIds = Array.from(new Set(existingInDb.map((f) => f.id).concat(Array.from(featureMap.values()))))

  await prisma.platformPlan.updateMany({
    where: { slug: { in: ["start", "iniciante"] } },
    data: { featureIds: startFeatureIds },
  })
  console.log(`✅ Plano Start/Iniciante atualizado com ${startFeatureIds.length} recursos.`)

  await prisma.platformPlan.updateMany({
    where: { slug: "pro" },
    data: { featureIds: proFeatureIds },
  })
  console.log(`✅ Plano Profissional Pro atualizado com ${proFeatureIds.length} recursos.`)

  await prisma.platformPlan.updateMany({
    where: { slug: "elite" },
    data: { featureIds: allFeatureIds },
  })
  console.log(`✅ Plano Elite atualizado com ${allFeatureIds.length} recursos (todos).`)

  console.log("\n✨ Seed do Catálogo de Recursos e Planos finalizado com sucesso!")
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed de recursos:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
