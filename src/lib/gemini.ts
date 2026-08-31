import { GoogleGenAI } from "@google/genai"

// Inicializa a instância do Google Gen AI com a chave do .env
const apiKey = process.env.GEMINI_API_KEY || ""

export const gemini = new GoogleGenAI({ apiKey })

/**
 * Modelos suportados na versão atual da API do Gemini
 */
export const CANDIDATE_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash",
]

/**
 * Helper com fallback automático de modelos
 */
async function generateContentWithFallback(prompt: string, config?: any) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada no arquivo .env.")
  }

  let lastError: any = null

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await gemini.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
          ...config,
        },
      })

      const text = response.text || "{}"
      return JSON.parse(text)
    } catch (err: any) {
      lastError = err
      const isNotFoundOrUnavailable = 
        err?.message?.includes("not found") || 
        err?.message?.includes("no longer available") || 
        err?.message?.includes("high demand") ||
        err?.code === 404 || 
        err?.status === 404 ||
        err?.code === 503 ||
        err?.status === 503

      if (isNotFoundOrUnavailable) {
        console.warn(`Modelo ${modelName} retornou erro (${err?.message}). Tentando próximo modelo...`)
        continue
      }
      throw err
    }
  }

  throw lastError || new Error("Não foi possível se comunicar com os modelos do Gemini.")
}

/**
 * 1. Gera biografia, slogans e títulos para o Website Institucional do estabelecimento
 */
export async function generateEstablishmentCopy(params: {
  name: string
  category: string
  city?: string | null
  differentials?: string
}) {
  const prompt = `
Você é um copywriter de elite especializado em marketing para o mercado de beleza, estética e cuidados pessoais (barbearias, salões, clínicas de estética, esmalterias, spas).

Dados do Estabelecimento:
- Nome: ${params.name}
- Categoria/Segmento: ${params.category}
- Localização/Cidade: ${params.city || "Brasil"}
- Diferenciais informados: ${params.differentials || "Atendimento premium, ambiente aconchegante, profissionais qualificados"}

Gere uma resposta em JSON puro (sem markdown, sem blocos de código adicionais, apenas JSON válido) com a seguinte estrutura:
{
  "tagline": "Slogan curto e impactante de 1 linha",
  "heroTitle": "Título chamativo para o banner principal do site",
  "heroSubtitle": "Subtítulo persuasivo destacando a experiência de 2 linhas",
  "aboutText": "Texto 'Sobre Nós' emocionante e profissional de 1 a 2 parágrafos",
  "instagramBio": "Bio para o Instagram com emojis e CTA para o link",
  "differentialsList": ["Diferencial 1", "Diferencial 2", "Diferencial 3", "Diferencial 4"]
}
`

  return generateContentWithFallback(prompt)
}

/**
 * 2. Gera descrições atraentes e benefícios para serviços cadastrados
 */
export async function generateServiceCopy(params: {
  serviceName: string
  businessType: string
  price?: number
}) {
  const prompt = `
Você é especialista em copywriting para serviços de estética e beleza.
Gere uma descrição persuasiva, profissional e atrativa para o seguinte serviço:
- Serviço: ${params.serviceName}
- Tipo de Negócio: ${params.businessType}
${params.price ? `- Preço médio: R$ ${params.price}` : ""}

Retorne em formato JSON puro:
{
  "shortDescription": "Descrição resumida de 1 linha para o cardápio de serviços",
  "fullDescription": "Descrição detalhada dos benefícios e sensação de 2 a 3 frases (máximo 3 linhas)",
  "recommendedDuration": 30,
  "highlights": ["Benefício 1", "Benefício 2", "Benefício 3"]
}
`

  return generateContentWithFallback(prompt)
}

/**
 * Gera descrição curta de no máximo 3 linhas para o serviço
 */
export async function generateServiceShortDescription(params: {
  serviceName: string
  category?: string
  businessType?: string
  price?: number
}) {
  const prompt = `
Você é um copywriter de elite para cardápios e sistemas de agendamento do setor de beleza e bem-estar.
Crie uma descrição atraente, objetiva e persuasiva de NO MÁXIMO 3 LINHAS (2 a 3 frases claras) para o seguinte serviço:
- Nome do Serviço: ${params.serviceName}
${params.category ? `- Categoria: ${params.category}` : ""}
${params.businessType ? `- Segmento do Espaço: ${params.businessType}` : ""}
${params.price ? `- Valor: R$ ${params.price}` : ""}

A descrição deve destacar o cuidado, a técnica ou o resultado final para despertar o desejo imediato de agendamento no cliente.

Retorne em JSON puro:
{
  "description": "Texto da descrição curta de no máximo 3 linhas",
  "suggestedDuration": 30,
  "suggestedPrice": 50.0,
  "suggestedCategory": "Categoria recomendada"
}
`

  return generateContentWithFallback(prompt)
}

/**
 * Gera sugestão completa ou complementar de catálogo de serviços para o nicho do negócio
 */
export async function generateServiceCatalogSuggestions(params: {
  businessType: string
  businessName?: string
  existingServices?: string[]
}) {
  const hasExisting = params.existingServices && params.existingServices.length > 0
  const existingListText = hasExisting ? params.existingServices?.join(", ") : "Nenhum serviço cadastrado ainda."

  const prompt = `
Você é um consultor sênior de negócios e precificação para o mercado de beleza, estética, barbearias, salões, esmalterias e spas no Brasil.
O estabelecimento é do tipo: "${params.businessType}" ${params.businessName ? `(Nome: ${params.businessName})` : ""}.

Serviços que o estabelecimento JÁ POSSUI cadastrados:
[${existingListText}]

Sua missão:
${
  hasExisting
    ? `Identifique o que já está na lista acima e gere de 5 a 8 serviços COMPLEMENTARES, adicionais ou novas tendências de mercado que AINDA NÃO ESTÃO na lista do estabelecimento. Não repita os serviços existentes.`
    : `Gere um catálogo inicial completo e de alta lucratividade com 6 a 10 dos serviços mais procurados e essenciais para esse segmento no Brasil.`
}

Para cada serviço sugerido, forneça:
- name: Nome profissional e comercialmente atraente
- category: Categoria adequada (Ex: Cabelo, Barba, Unhas, Facial, Corporal, etc.)
- description: Descrição persuasiva de no máximo 3 linhas destacando a experiência/benefício
- price: Preço médio realista de mercado em Reais (Float/Number, ex: 45.0, 70.0, 130.0)
- durationMinutes: Duração estimada recomendada em minutos (Int/Number, ex: 30, 45, 60, 90)

Retorne em JSON puro no formato:
{
  "suggestions": [
    {
      "name": "Nome do Serviço",
      "category": "Categoria",
      "description": "Descrição curta de até 3 linhas.",
      "price": 45.0,
      "durationMinutes": 30
    }
  ]
}
`

  return generateContentWithFallback(prompt)
}

/**
 * 3. Gera mensagens personalizadas para o Robô de WhatsApp
 */
export async function generateWhatsAppTemplates(businessName: string) {
  const prompt = `
Crie 3 templates de mensagens profissionais, cordiais e humanizadas para disparos de WhatsApp do estabelecimento "${businessName}".
Campos dinâmicos permitidos: {{nome_cliente}}, {{servico}}, {{data_hora}}, {{profissional}}, {{link_cancelamento}}.

Retorne em formato JSON puro:
{
  "lembrete2h": "Mensagem lembrete 2 horas antes com confirmação de presença (Digite 1 para Confirmar)",
  "confirmacaoAgendamento": "Mensagem de confirmação imediata após agendar pelo site",
  "posAtendimento": "Mensagem de agradecimento e pedido de avaliação pós-serviço"
}
`

  return generateContentWithFallback(prompt)
}

/**
 * 4. Gera minibiografia e destaques para o perfil do Profissional da equipe
 */
export async function generateProfessionalBio(params: {
  name: string
  specialty: string
  businessType?: string
  experience?: string
}) {
  const prompt = `
Você é um redator de perfis profissionais de alto padrão para o setor de beleza, estética e cuidados pessoais.
Crie uma minibiografia envolvente, acolhedora e confiável para o seguinte integrante da equipe:
- Nome: ${params.name}
- Função / Especialidade: ${params.specialty}
- Segmento: ${params.businessType || "Beleza e Estética"}
- Experiência / Destaques adicionais: ${params.experience || "Atendimento personalizado e atenção aos detalhes"}

Retorne em formato JSON puro:
{
  "bio": "Texto de 2 a 3 frases fluido e profissional para exibir no Website Institucional",
  "shortHighlight": "Frase curta de 1 linha de impacto (ex: Especialista em degradê impecável e visagismo)",
  "skills": ["Habilidade 1", "Habilidade 2", "Habilidade 3"]
}
`

  return generateContentWithFallback(prompt)
}
