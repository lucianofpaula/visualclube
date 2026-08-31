"use server"

import { auth } from "@/auth"
import { 
  generateEstablishmentCopy, 
  generateServiceCopy, 
  generateWhatsAppTemplates,
  generateProfessionalBio
} from "@/lib/gemini"

/**
 * Server Action para gerar copy do Website e Instagram com Gemini IA
 */
export async function generateAiEstablishmentAction(params: {
  name: string
  category: string
  city?: string | null
  differentials?: string
}) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  try {
    const result = await generateEstablishmentCopy(params)
    return { success: true, data: result }
  } catch (error: any) {
    console.error("Erro ao gerar conteúdo com Gemini:", error)
    return {
      success: false,
      error: error?.message || "Falha ao se comunicar com a Inteligência Artificial. Verifique sua chave de API.",
    }
  }
}

/**
 * Server Action para gerar descrição inteligente de um serviço
 */
export async function generateAiServiceAction(params: {
  serviceName: string
  businessType: string
  price?: number
}) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  try {
    const result = await generateServiceCopy(params)
    return { success: true, data: result }
  } catch (error: any) {
    console.error("Erro ao gerar descrição do serviço com Gemini:", error)
    return {
      success: false,
      error: error?.message || "Falha ao gerar descrição com IA.",
    }
  }
}

/**
 * Server Action para gerar descrição curta (máximo 3 linhas) de um serviço
 */
export async function generateAiServiceShortDescriptionAction(params: {
  serviceName: string
  category?: string
  businessType?: string
  price?: number
}) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  try {
    const { generateServiceShortDescription } = await import("@/lib/gemini")
    const result = await generateServiceShortDescription(params)
    return { success: true, data: result }
  } catch (error: any) {
    console.warn("Gemini offline ou chave ausente, usando fallback inteligente de descrição:", error)
    
    // Fallback inteligente caso a chave ou modelo não responda
    const name = params.serviceName.trim()
    const cat = params.category || "Cuidado Especial"
    const fallbackDesc = `Procedimento de ${name} realizado com produtos de alta performance, técnica especializada e foco em excelência e durabilidade para você se sentir incrível.`
    
    return {
      success: true,
      data: {
        description: fallbackDesc,
        suggestedDuration: 30,
        suggestedPrice: params.price || 45.0,
        suggestedCategory: cat,
      },
    }
  }
}

/**
 * Server Action para sugerir catálogo de serviços por IA com base no segmento do estabelecimento
 */
export async function generateAiServiceCatalogAction(params: {
  businessType: string
  businessName?: string
  existingServices?: string[]
}) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  try {
    const { generateServiceCatalogSuggestions } = await import("@/lib/gemini")
    const result = await generateServiceCatalogSuggestions(params)

    if (result?.suggestions && Array.isArray(result.suggestions) && result.suggestions.length > 0) {
      return { success: true, data: result.suggestions }
    }

    throw new Error("Resposta da IA vazia.")
  } catch (error: any) {
    console.warn("Gemini offline ou com erro, utilizando presets curados do segmento:", error)
    
    const { getPresetServicesForBusinessType } = await import("@/lib/service-categories")
    const presets = getPresetServicesForBusinessType(params.businessType, params.existingServices || [])
    
    return {
      success: true,
      data: presets,
      isFallback: true,
    }
  }
}

/**
 * Server Action para gerar templates de WhatsApp com Gemini
 */
export async function generateAiWhatsAppAction(businessName: string) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  try {
    const result = await generateWhatsAppTemplates(businessName)
    return { success: true, data: result }
  } catch (error: any) {
    console.error("Erro ao gerar mensagens de WhatsApp com Gemini:", error)
    return {
      success: false,
      error: error?.message || "Falha ao gerar mensagens com IA.",
    }
  }
}

/**
 * Server Action para gerar biografia profissional inteligente com Gemini IA
 */
export async function generateAiProfessionalBioAction(params: {
  name: string
  specialty: string
  businessType?: string
  experience?: string
}) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  try {
    const result = await generateProfessionalBio(params)
    return { success: true, data: result }
  } catch (error: any) {
    console.error("Erro ao gerar bio do profissional com Gemini:", error)
    return {
      success: false,
      error: error?.message || "Falha ao gerar biografia com IA.",
    }
  }
}

