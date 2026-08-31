import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando o seed dos Planos da Plataforma...")

  const plans = [
    {
      slug: "start",
      name: "Start",
      badge: "Iniciante",
      description: "Ideal para profissionais autônomos ou espaços com até 2 profissionais.",
      priceMonthly: 69.90,
      priceYearly: 49.90,
      trialDays: 7,
      maxProfessionals: 2,
      hasWhatsappBot: false,
      hasVipClub: false,
      hasMultiUnits: false,
      features: [
        "Até 2 profissionais na equipe",
        "Agendamentos online ilimitados",
        "Link personalizado para Instagram",
        "Controle de comandas básico",
        "Relatório financeiro mensal",
        "Suporte por e-mail e WhatsApp",
      ],
      notIncluded: [
        "Robô de confirmação automática WhatsApp",
        "Clube de Assinaturas & Recorrência",
        "Split de pagamento e comissão avançada",
      ],
      // 1 nível de indicação: 10%
      referralRates: [
        { level: 1, percentage: 10.0 },
      ],
      order: 1,
      isActive: true,
    },
    {
      slug: "pro",
      name: "Profissional Pro",
      badge: "Mais Popular",
      description: "O mais escolhido. Perfeito para barbearias, salões e estéticas que querem crescer.",
      priceMonthly: 129.90,
      priceYearly: 97.90,
      trialDays: 7,
      maxProfessionals: 8,
      hasWhatsappBot: true,
      hasVipClub: true,
      hasMultiUnits: false,
      features: [
        "Até 8 profissionais inclusos",
        "Agendamentos online 24/7 sem limites",
        "Robô WhatsApp com confirmação de presença",
        "Comandas Digitais completas com Bar/Produtos",
        "Split automático de comissões por profissional",
        "Módulo de Clube VIP / Assinaturas Recorrentes",
        "Controle de estoque de produtos e bebidas",
        "PIX com baixa automática no sistema",
        "Suporte prioritário via WhatsApp",
      ],
      notIncluded: [],
      // 2 níveis de indicação: Nível 1: 20%, Nível 2: 10%
      referralRates: [
        { level: 1, percentage: 20.0 },
        { level: 2, percentage: 10.0 },
      ],
      order: 2,
      isActive: true,
    },
    {
      slug: "elite",
      name: "Elite Multi-Unidades",
      badge: "Empresarial",
      description: "Para redes de salões, barbearias grandes ou franquias que necessitam de escala.",
      priceMonthly: 249.90,
      priceYearly: 189.90,
      trialDays: 7,
      maxProfessionals: -1, // Ilimitado
      hasWhatsappBot: true,
      hasVipClub: true,
      hasMultiUnits: true,
      features: [
        "Profissionais ilimitados",
        "Gestão multi-unidades / filiais",
        "Todas as funções do plano Pro inclusas",
        "Múltiplos robôs de WhatsApp por filial",
        "API aberta para integração contábil e ERP",
        "Gerente de conta dedicado",
        "Migração gratuita dos seus dados antigos",
      ],
      notIncluded: [],
      // 3 níveis de indicação: Nível 1: 25%, Nível 2: 15%, Nível 3: 5%
      referralRates: [
        { level: 1, percentage: 25.0 },
        { level: 2, percentage: 15.0 },
        { level: 3, percentage: 5.0 },
      ],
      order: 3,
      isActive: true,
    },
  ]

  for (const plan of plans) {
    const upserted = await prisma.platformPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    })
    console.log(`✅ Plano [${upserted.name}] upserted com sucesso! (referralLevels: ${JSON.stringify(upserted.referralRates)})`)
  }

  console.log("✨ Seed de planos finalizado com sucesso!")
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
