/**
 * Catálogo de Funções e Especialidades Pré-definidas por Segmento
 */

export interface RolePreset {
  id: string
  label: string
  description: string
  iconName?: string
}

export const ROLES_BY_SEGMENT: Record<string, RolePreset[]> = {
  BARBERSHOP: [
    { id: "barbeiro_master", label: "Barbeiro Master", description: "Profissional sênior especialista em visagismo e cortes avançados" },
    { id: "barbeiro_tradicional", label: "Barbeiro Tradicional", description: "Especialista em tesoura, navalha e cortes clássicos" },
    { id: "especialista_fade", label: "Especialista em Degradê / Fade", description: "Mestre em disfarces milimétricos, fade e freestyle" },
    { id: "barboterapeuta", label: "Barboterapeuta / Terapeuta Capilar", description: "Tratamentos faciais, toalha quente e alinhamento de barba" },
    { id: "colorista_masculino", label: "Colorista Masculino", description: "Especialista em platinados, luzes, camuflagem de grisalhos" },
    { id: "visagista", label: "Visagista Masculino", description: "Consultoria de imagem facial e adequação de corte ao formato do rosto" },
    { id: "assistente_barbearia", label: "Assistente de Barbearia", description: "Lavagem, hidratação e apoio ao atendimento" },
  ],
  HAIR_SALON: [
    { id: "hair_stylist_master", label: "Cabeleireiro(a) Master", description: "Profissional de ponta para transformações completas e visagismo" },
    { id: "colorista_mechas", label: "Colorista & Especialista em Mechas", description: "Loiras, morenas iluminadas, balayage e colorimetria avançada" },
    { id: "especialista_cortes", label: "Hair Stylist (Cortes Femininos)", description: "Cortes modernos, desfiados, chanel, camadas e franjas" },
    { id: "especialista_penteados", label: "Especialista em Penteados & Noivas", description: "Produção para eventos, madrinhas, formandas e noivas" },
    { id: "terapeuta_capilar", label: "Terapeuta Capilar / Tricologista", description: "Saúde do couro cabeludo, cronograma capilar e reconstruções" },
    { id: "escovista_tratamentos", label: "Escovista & Tratamentos", description: "Modelagens, botox, selagens, escova progressiva e hidratação" },
    { id: "assistente_salao", label: "Assistente de Salão", description: "Lavatório, preparação dos fios e suporte técnico" },
  ],
  NAIL_SALON: [
    { id: "nail_designer", label: "Nail Designer (Alongamento)", description: "Alongamento em fibra de vidro, gel na tip e polygel" },
    { id: "manicure_tradicional", label: "Manicure & Pedicure Tradicional", description: "Cuticulagem perfeita, esmaltação e cuidado básico" },
    { id: "esmaltacao_gel", label: "Especialista em Esmaltação em Gel", description: "Unhas com brilho e durabilidade de até 20 dias" },
    { id: "podologa", label: "Podóloga / Cuidado dos Pés", description: "Tratamento de unhas encravadas, calosidades e spa podal" },
    { id: "spa_pes_maos", label: "Especialista em Spa dos Pés & Mãos", description: "Esfoliação profunda, parafina térmica e massagem relaxante" },
  ],
  AESTHETICS: [
    { id: "esteticista_facial", label: "Esteticista Facial & Corporal", description: "Limpeza de pele profunda, peelings, drenagens e massagens" },
    { id: "biomedica_esteta", label: "Biomédica Esteta / Harmonizadora", description: "Procedimentos injetáveis, bioestimuladores e toxina botulínica" },
    { id: "lash_designer", label: "Lash Designer (Extensão de Cílios)", description: "Volume russo, fio a fio clássico, híbrido e lash lifting" },
    { id: "designer_sobrancelhas", label: "Designer de Sobrancelhas & Micro", description: "Mapeamento facial, henna, micropigmentação e brow lamination" },
    { id: "especialista_depilacao", label: "Especialista em Depilação", description: "Depilação a cera morna, cera egípcia (linha) e laser" },
    { id: "massoterapeuta", label: "Massoterapeuta / Relaxamento", description: "Massagem relaxante, pedras quentes e ventosaterapia" },
  ],
  SPA: [
    { id: "terapeuta_spa", label: "Terapeuta Holística / Massoterapeuta", description: "Banhos de imersão, aromaterapia, reflexologia e relaxamento" },
    { id: "esteticista_spa", label: "Esteticista Corporal", description: "Drenagem linfática, esfoliações corporais e rituais de bem-estar" },
  ],
  TATTOO_STUDIO: [
    { id: "tatuador_master", label: "Tatuador(a) Especialista", description: "Realismo, fineline, blackwork, old school ou aquarela" },
    { id: "body_piercer", label: "Body Piercer Profissional", description: "Perfurações estéreis, microdermais e joalheria em titânio" },
  ],
  OTHER: [
    { id: "profissional_geral", label: "Profissional Especialista", description: "Atendimento técnico e serviços do estabelecimento" },
    { id: "recepcionista_gerente", label: "Gerente / Atendente", description: "Organização de recepção, agenda e atendimento ao cliente" },
  ],
}

/**
 * Paleta de cores para identificação na grade de horários
 */
export const SCHEDULE_COLORS = [
  { hex: "#10b981", label: "Esmeralda" },
  { hex: "#0ea5e9", label: "Azul Céu" },
  { hex: "#8b5cf6", label: "Violeta" },
  { hex: "#f59e0b", label: "Âmbar Dourado" },
  { hex: "#f43f5e", label: "Rosa Rubi" },
  { hex: "#6366f1", label: "Índigo" },
  { hex: "#14b8a6", label: "Teal" },
  { hex: "#f97316", label: "Coral / Laranja" },
]

/**
 * Retorna a lista de funções adequadas para o tipo de negócio
 */
export function getRolesForBusinessType(type?: string | null): RolePreset[] {
  const normalized = (type || "BARBERSHOP").toUpperCase()
  const list = ROLES_BY_SEGMENT[normalized] || ROLES_BY_SEGMENT.BARBERSHOP
  return list
}
