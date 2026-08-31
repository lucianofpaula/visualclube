/**
 * Categorias e Catálogo Padrão de Serviços por Segmento de Negócio
 */

export interface ServicePreset {
  name: string
  category: string
  price: number
  durationMinutes: number
  description: string
  customCommission?: number
}

export interface SegmentConfig {
  label: string
  categories: string[]
  defaultServices: ServicePreset[]
  complementaryServices: ServicePreset[]
}

export const SEGMENTS_CONFIG: Record<string, SegmentConfig> = {
  BARBERSHOP: {
    label: "Barbearia",
    categories: ["Cabelo", "Barba", "Combos", "Tratamentos", "Sobrancelha & Acabamento"],
    defaultServices: [
      {
        name: "Corte Degradê / Fade Moderno",
        category: "Cabelo",
        price: 45.0,
        durationMinutes: 35,
        description: "Corte com degradê milimétrico, visagismo e finalização premium com pomada matte.",
      },
      {
        name: "Barboterapia com Toalha Quente",
        category: "Barba",
        price: 40.0,
        durationMinutes: 30,
        description: "Ritual completo com toalha quente, óleo hidratante, lâmina descartável e pós-barba refrescante.",
      },
      {
        name: "Combo Cabelo + Barba Completa",
        category: "Combos",
        price: 75.0,
        durationMinutes: 60,
        description: "A experiência completa da barbearia: corte alinhado ao seu estilo e barba desenhada com toalha quente.",
      },
      {
        name: "Corte Tradicional / Tesoura",
        category: "Cabelo",
        price: 40.0,
        durationMinutes: 30,
        description: "Corte clássico feito na tesoura ou máquina para um visual elegante e alinhado.",
      },
      {
        name: "Design de Sobrancelha Masculina",
        category: "Sobrancelha & Acabamento",
        price: 20.0,
        durationMinutes: 15,
        description: "Limpeza e desenho natural na navalha ou pinça mantendo a masculinidade do olhar.",
      },
      {
        name: "Camuflagem de Fios Brancos (Barba ou Cabelo)",
        category: "Tratamentos",
        price: 50.0,
        durationMinutes: 25,
        description: "Tonalização suave e discreta para rejuvenescer o visual com acabamento 100% natural.",
      },
      {
        name: "Hidratação & Lavagem Especial",
        category: "Tratamentos",
        price: 30.0,
        durationMinutes: 20,
        description: "Higienização profunda do couro cabeludo com massagem relaxante e máscara de nutrição.",
      },
      {
        name: "Pezinho & Acabamento Navalhado",
        category: "Sobrancelha & Acabamento",
        price: 20.0,
        durationMinutes: 15,
        description: "Manutenção do contorno do corte e nuca com navalha para prolongar o frescor do corte.",
      },
    ],
    complementaryServices: [
      {
        name: "Platinado Global / Nevou",
        category: "Cabelo",
        price: 130.0,
        durationMinutes: 90,
        description: "Descoloração de alta performance e matização uniforme para um platinado impecável.",
      },
      {
        name: "Selagem Redutora Capilar",
        category: "Tratamentos",
        price: 80.0,
        durationMinutes: 50,
        description: "Alinhamento dos fios, redução de volume e frizz com brilho e sedosidade.",
      },
      {
        name: "Limpeza de Pele com Máscara Black",
        category: "Tratamentos",
        price: 35.0,
        durationMinutes: 25,
        description: "Remoção de cravos e oleosidade excessiva da zona T com esfoliação e máscara de carvão ativado.",
      },
      {
        name: "Depilação Nasal e Orelha com Cera",
        category: "Sobrancelha & Acabamento",
        price: 25.0,
        durationMinutes: 15,
        description: "Higiene rápida e sem dor para remoção de pelos indesejados no nariz e orelhas.",
      },
    ],
  },
  HAIR_SALON: {
    label: "Salão de Beleza",
    categories: ["Cortes", "Coloração & Mechas", "Tratamentos & Escovas", "Penteados & Noivas", "Unhas"],
    defaultServices: [
      {
        name: "Corte Feminino com Visagismo & Modelagem",
        category: "Cortes",
        price: 70.0,
        durationMinutes: 45,
        description: "Consultoria de corte adequada ao formato do rosto e finalização modelada com escova.",
      },
      {
        name: "Lavagem Especial com Escova Modelada",
        category: "Tratamentos & Escovas",
        price: 45.0,
        durationMinutes: 40,
        description: "Higienização revigorante com shampoo profissional e escova lisa ou com ondas impecáveis.",
      },
      {
        name: "Mechas Criativas / Morena Iluminada",
        category: "Coloração & Mechas",
        price: 280.0,
        durationMinutes: 180,
        description: "Técnica personalizada de iluminação dos fios com proteção plex e tonalização sofisticada.",
      },
      {
        name: "Coloração de Raiz / Tonalização",
        category: "Coloração & Mechas",
        price: 110.0,
        durationMinutes: 60,
        description: "Cobertura total de fios brancos ou uniformização da cor com brilho intenso.",
      },
      {
        name: "Cronograma Capilar / Nutrição Profunda",
        category: "Tratamentos & Escovas",
        price: 85.0,
        durationMinutes: 45,
        description: "Tratamento intensivo de reposição de massa, aminoácidos e lipídios para cabelos saudáveis.",
      },
      {
        name: "Botox Capilar / Alinhamento Térmico",
        category: "Tratamentos & Escovas",
        price: 140.0,
        durationMinutes: 90,
        description: "Redução de frizz, fechamento de cutículas e brilho espelhado sem agressão aos fios.",
      },
      {
        name: "Penteado Social / Festas",
        category: "Penteados & Noivas",
        price: 120.0,
        durationMinutes: 60,
        description: "Penteados presos, semipresos ou tranças elegantes de alta durabilidade para ocasiões especiais.",
      },
    ],
    complementaryServices: [
      {
        name: "Terapia do Ozônio Capilar",
        category: "Tratamentos & Escovas",
        price: 95.0,
        durationMinutes: 45,
        description: "Fortalecimento do bulbo capilar, combate à queda e oxigenação celular profunda com vapor de ozônio.",
      },
      {
        name: "Corte Bordado (Anti-Pontas Duplas)",
        category: "Cortes",
        price: 60.0,
        durationMinutes: 35,
        description: "Elimina as pontas duplas e ressecadas ao longo dos fios sem mexer no comprimento.",
      },
      {
        name: "Maquiagem Social Profissional",
        category: "Penteados & Noivas",
        price: 130.0,
        durationMinutes: 60,
        description: "Make com produtos de alta fixação, contorno harmonioso e cílios postiços inclusos.",
      },
    ],
  },
  NAIL_SALON: {
    label: "Esmalteria & Nail Bar",
    categories: ["Manicure", "Pedicure", "Alongamentos", "Spa & Cuidados", "Nail Art"],
    defaultServices: [
      {
        name: "Manicure Tradicional",
        category: "Manicure",
        price: 30.0,
        durationMinutes: 35,
        description: "Cuticulagem perfeita, esfoliação suave, hidratação e esmaltação uniforme com brilho duradouro.",
      },
      {
        name: "Pedicure Tradicional",
        category: "Pedicure",
        price: 35.0,
        durationMinutes: 40,
        description: "Higienização, remoção de asperezas, cuticulagem delicada e esmaltação impecável dos pés.",
      },
      {
        name: "Combo Manicure + Pedicure Completo",
        category: "Manicure",
        price: 60.0,
        durationMinutes: 70,
        description: "O cuidado clássico e completo para pés e mãos impecáveis em uma única sessão.",
      },
      {
        name: "Alongamento em Fibra de Vidro (Aplicação)",
        category: "Alongamentos",
        price: 140.0,
        durationMinutes: 120,
        description: "Unhas longas, resistentes e com acabamento ultra natural no formato que você preferir.",
      },
      {
        name: "Manutenção de Fibra de Vidro / Gel",
        category: "Alongamentos",
        price: 90.0,
        durationMinutes: 90,
        description: "Reposição de estrutura, nivelamento, troca de cor e reforço para manter seu alongamento perfeito.",
      },
      {
        name: "Esmaltação em Gel (Mãos)",
        category: "Manicure",
        price: 55.0,
        durationMinutes: 45,
        description: "Unhas secas instantaneamente na cabine LED com durabilidade e brilho de até 20 dias sem descascar.",
      },
      {
        name: "Spa dos Pés com Parafina e Massagem",
        category: "Spa & Cuidados",
        price: 50.0,
        durationMinutes: 40,
        description: "Esfoliação profunda, hidratação com parafina aquecida e massagem relaxante nos pés.",
      },
      {
        name: "Nail Art & Decoração Personalizada",
        category: "Nail Art",
        price: 25.0,
        durationMinutes: 20,
        description: "Francesinha moderna, pedrarias, encapsuladas ou desenhos manuais exclusivos.",
      },
    ],
    complementaryServices: [
      {
        name: "Banho de Gel sobre Unha Natural",
        category: "Alongamentos",
        price: 75.0,
        durationMinutes: 60,
        description: "Camada de gel fortalecedora para evitar quebras e auxiliar no crescimento natural das suas unhas.",
      },
      {
        name: "Remoção Segura de Alongamento",
        category: "Alongamentos",
        price: 40.0,
        durationMinutes: 30,
        description: "Retirada cuidadosa do material sem agredir a lâmina natural, com aplicação de óleo nutritivo.",
      },
      {
        name: "Plástica dos Pés (Tratamento de Rachaduras)",
        category: "Spa & Cuidados",
        price: 65.0,
        durationMinutes: 45,
        description: "Procedimento sem dor para remoção completa de calosidades e rachaduras severas com hidratação intensa.",
      },
    ],
  },
  ESTHETICS_CLINIC: {
    label: "Clínica de Estética",
    categories: ["Facial", "Corporal", "Cílios & Sobrancelhas", "Depilação", "Massoterapia"],
    defaultServices: [
      {
        name: "Limpeza de Pele Profunda com Fototerapia",
        category: "Facial",
        price: 110.0,
        durationMinutes: 60,
        description: "Higienização profunda, vapor de ozônio, extração de cravos e LED azul para acalmar a pele.",
      },
      {
        name: "Drenagem Linfática Corporal Método Exclusivo",
        category: "Corporal",
        price: 90.0,
        durationMinutes: 50,
        description: "Estimula o sistema linfático, reduz retenção de líquidos, inchaço e toxinas corporais.",
      },
      {
        name: "Design de Sobrancelhas com Henna / Tintura",
        category: "Cílios & Sobrancelhas",
        price: 45.0,
        durationMinutes: 35,
        description: "Mapeamento facial personalizado, alinhamento dos fios e preenchimento natural com alta fixação.",
      },
      {
        name: "Extensão de Cílios Volume Brasileiro / Russo",
        category: "Cílios & Sobrancelhas",
        price: 130.0,
        durationMinutes: 90,
        description: "Olhar marcante com fios leves em formato Y que proporcionam densidade e efeito delineado.",
      },
      {
        name: "Peeling de Diamante + Máscara Clareadora",
        category: "Facial",
        price: 95.0,
        durationMinutes: 45,
        description: "Microdermoabrasão suave para renovação celular, melhora dos poros e uniformização do tom da pele.",
      },
      {
        name: "Massagem Relaxante com Óleos Essenciais",
        category: "Massoterapia",
        price: 90.0,
        durationMinutes: 50,
        description: "Alívio de tensões musculares, redução de estresse e sensação imediata de leveza e bem-estar.",
      },
      {
        name: "Depilação a Cera Morna / Roll-on (Virilha ou Meia Perna)",
        category: "Depilação",
        price: 45.0,
        durationMinutes: 30,
        description: "Remoção higiênica e suave de pelos com cera com ativos calmantes de camomila.",
      },
    ],
    complementaryServices: [
      {
        name: "Lash Lifting & Nutrição de Cílios",
        category: "Cílios & Sobrancelhas",
        price: 85.0,
        durationMinutes: 50,
        description: "Curvatura e hidratação dos seus cílios naturais com efeito curvex e rímel por até 6 semanas.",
      },
      {
        name: "Brow Lamination (Alinhamento dos Fios)",
        category: "Cílios & Sobrancelhas",
        price: 80.0,
        durationMinutes: 45,
        description: "Fios alinhados na direção desejada criando um efeito de sobrancelhas mais cheias e volumosas.",
      },
      {
        name: "Massagem Modeladora com Turbinada",
        category: "Corporal",
        price: 85.0,
        durationMinutes: 45,
        description: "Manobras rápidas e firmes para ativação da circulação e modelagem do contorno corporal.",
      },
    ],
  },
  SPA: {
    label: "Spa & Bem-Estar",
    categories: ["Massagens", "Rituais de Imersão", "Corporal", "Facial & Relax"],
    defaultServices: [
      {
        name: "Massagem com Pedras Quentes Vulcânicas",
        category: "Massagens",
        price: 130.0,
        durationMinutes: 60,
        description: "Termoterapia que combina calor e toques suaves para relaxamento muscular profundo e alívio do estresse.",
      },
      {
        name: "Banho de Imersão em Ofurô com Sais & Pétalas",
        category: "Rituais de Imersão",
        price: 150.0,
        durationMinutes: 50,
        description: "Imersão relaxante enriquecida com óleos essenciais, hidratação profunda e cromoterapia.",
      },
      {
        name: "Day Spa Revitalizante Individual",
        category: "Rituais de Imersão",
        price: 260.0,
        durationMinutes: 120,
        description: "Experiência de renovação com esfoliação corporal, massagem relaxante, máscara facial e chá gourmet.",
      },
      {
        name: "Esfoliação Corporal com Hidratação Aveludada",
        category: "Corporal",
        price: 95.0,
        durationMinutes: 45,
        description: "Remoção de células mortas com cristais nutritivos e aplicação de manteiga corporal emoliente.",
      },
      {
        name: "Reflexologia Podal com Escalda-Pés Aromático",
        category: "Massagens",
        price: 75.0,
        durationMinutes: 40,
        description: "Estímulo dos pontos reflexos nos pés para equilíbrio energético, alívio de cansaço e dores.",
      },
    ],
    complementaryServices: [
      {
        name: "Massagem a Quatro Mãos (Sincronizada)",
        category: "Massagens",
        price: 210.0,
        durationMinutes: 60,
        description: "Dois terapeutas em perfeita sincronia proporcionando uma experiência sensorial inigualável.",
      },
      {
        name: "Spa do Casal com Massagem e Espumante",
        category: "Rituais de Imersão",
        price: 340.0,
        durationMinutes: 90,
        description: "Momento a dois inesquecível em ambiente intimista com massagem relaxante e taça de espumante.",
      },
    ],
  },
  TATTOO_STUDIO: {
    label: "Studio de Tatuagem & Piercing",
    categories: ["Tatuagem", "Body Piercing", "Consultoria & Desenho"],
    defaultServices: [
      {
        name: "Tatuagem Fine Line / Delicada (Até 5cm)",
        category: "Tatuagem",
        price: 180.0,
        durationMinutes: 60,
        description: "Traços ultrafinos, precisos e elegantes com pigmentos homologados pela Anvisa.",
      },
      {
        name: "Tatuagem Média / Autoral (Até 12cm)",
        category: "Tatuagem",
        price: 380.0,
        durationMinutes: 120,
        description: "Projeto personalizado com criação exclusiva e aplicação com materiais 100% esterilizados e descartáveis.",
      },
      {
        name: "Perfuração Básica de Piercing (com Joia em Titânio)",
        category: "Body Piercing",
        price: 90.0,
        durationMinutes: 30,
        description: "Procedimento asséptico com agulha americana (cateter) e joia hipoalergênica em titânio biocompatível.",
      },
      {
        name: "Atualização / Troca de Joia de Piercing",
        category: "Body Piercing",
        price: 40.0,
        durationMinutes: 20,
        description: "Substituição segura da joia por modelos ornamentados com assepsia e orientação pós-troca.",
      },
    ],
    complementaryServices: [
      {
        name: "Cobertura de Tatuagem Antiga (Cover-up)",
        category: "Tatuagem",
        price: 450.0,
        durationMinutes: 180,
        description: "Estudo de viabilidade e pigmentação estratégica para cobrir ou reformar tatuagens antigas.",
      },
      {
        name: "Microdermal em Titânio com Topo Brilhante",
        category: "Body Piercing",
        price: 140.0,
        durationMinutes: 40,
        description: "Aplicação pontual de âncora dérmica para brilho sofisticado em áreas planas do corpo.",
      },
    ],
  },
  OTHER: {
    label: "Geral / Outros",
    categories: ["Serviços Principais", "Atendimentos Especiais", "Pacotes & Combos"],
    defaultServices: [
      {
        name: "Atendimento Especializado Padrão",
        category: "Serviços Principais",
        price: 60.0,
        durationMinutes: 40,
        description: "Sessão profissional com produtos de primeira linha e foco na excelência dos resultados.",
      },
      {
        name: "Atendimento Express / Rápido",
        category: "Serviços Principais",
        price: 40.0,
        durationMinutes: 20,
        description: "Procedimento ágil e pontual com toda a qualidade para quem tem a rotina corrida.",
      },
      {
        name: "Combo / Sessão Completa Premium",
        category: "Pacotes & Combos",
        price: 110.0,
        durationMinutes: 60,
        description: "Pacote completo com tratamento diferenciado e benefícios estendidos.",
      },
    ],
    complementaryServices: [
      {
        name: "Consultoria e Avaliação Personalizada",
        category: "Atendimentos Especiais",
        price: 50.0,
        durationMinutes: 30,
        description: "Diagnóstico inicial para recomendação do melhor plano de tratamento de acordo com sua necessidade.",
      },
    ],
  },
}

/**
 * Retorna as categorias padrão recomendadas para o tipo de negócio
 */
export function getCategoriesForBusinessType(type?: string | null): string[] {
  const key = (type || "BARBERSHOP").toUpperCase()
  const config = SEGMENTS_CONFIG[key] || SEGMENTS_CONFIG.BARBERSHOP
  return config.categories
}

/**
 * Retorna os serviços padrão recomendados para fallback de um segmento
 */
export function getPresetServicesForBusinessType(
  type?: string | null,
  existingNames: string[] = []
): ServicePreset[] {
  const key = (type || "BARBERSHOP").toUpperCase()
  const config = SEGMENTS_CONFIG[key] || SEGMENTS_CONFIG.BARBERSHOP

  const normalizedExisting = existingNames.map((n) => n.trim().toLowerCase())

  if (normalizedExisting.length === 0) {
    return config.defaultServices
  }

  // Se já possui serviços, junta os defaults não existentes + complementares
  const allCandidates = [...config.defaultServices, ...config.complementaryServices]
  const filtered = allCandidates.filter(
    (item) => !normalizedExisting.some((ex) => ex.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(ex))
  )

  return filtered.length > 0 ? filtered : config.complementaryServices
}

export const COMMON_DURATIONS = [
  { value: 15, label: "15 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 40, label: "40 min" },
  { value: 45, label: "45 min" },
  { value: 50, label: "50 min" },
  { value: 60, label: "1 hora (60 min)" },
  { value: 75, label: "1h15 (75 min)" },
  { value: 90, label: "1h30 (90 min)" },
  { value: 120, label: "2 horas (120 min)" },
  { value: 180, label: "3 horas (180 min)" },
]
