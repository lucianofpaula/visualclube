# 04 — Planos de Assinatura SaaS & Comissionamento Interno por Níveis (JSON)

**Data:** 2026-08-26  
**Status:** ✅ Implementado

---

## Visão Geral

Implementação completa do sistema de **Planos de Assinatura da Plataforma VisualClube (SaaS)** com:
- Três planos configurados: **Start**, **Profissional Pro** e **Elite Multi-Unidades**.
- Configuração de comissões por indicação e níveis armazenada exclusivamente no **JSON interno do banco de dados** (`referralRates` no model `PlatformPlan`).
- **Nenhuma informação de comissão ou percentual é exibida na interface visual/apresentação dos planos** para os usuários finais ou na landing page.
- Período de **7 dias de teste grátis (Trial)** ativado com 1 clique, sem necessidade de cartão de crédito.
- Liberação condicional de recursos: o usuário acessa o painel normalmente, visualiza um banner com os planos e os menus não contratados exibem um **ícone de cadeado** (🔒).
- Geração automática de comissões multinível pendentes (`status: PENDING`) nos bastidores para a linha ascendente (`uplineIds`) no momento do início do plano/trial.

---

## Arquivos Criados / Modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `prisma/schema.prisma` | MODIFICADO | Models `PlatformPlan`, `UserPlatformSubscription` e enums `BillingCycle`, `SubscriptionStatus` |
| `prisma/seed-plans.ts` | NOVO | Seed com os 3 planos no MongoDB contendo seus respectivos JSONs de indicação no banco |
| `src/actions/subscription-actions.ts` | NOVO | Server Actions de assinatura, trial e cálculo interno de comissões multinível |
| `src/components/landing/pricing-section.tsx` | MODIFICADO | Apresentação limpa dos planos focada no produto SaaS (sem menção a comissões) |
| `src/components/app/plans-modal.tsx` | NOVO | Modal limpo com toggle Mensal/Anual, detalhamento de features e ativação de 7 dias grátis |
| `src/components/app/subscription-banner.tsx` | NOVO | Banner de destaque no topo da página inicial para novos cadastros (sem plano) e contagem de trial |
| `src/components/app/app-shell.tsx` | NOVO | Shell client do painel com gerenciamento de planos e cadeados nos menus |
| `src/components/app/locked-feature-guard.tsx` | NOVO | Bloqueio visual elegante para módulos não liberados |
| `src/app/(app)/app/layout.tsx` | MODIFICADO | Server Component que alimenta o `AppShell` |
| `src/app/(app)/app/page.tsx` | MODIFICADO | Dashboard com banner de boas-vindas e bloqueio dinâmico nos cards |
