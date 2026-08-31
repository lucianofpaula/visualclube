# 02 — Layout, Breadcrumb e Gradiente dos Cards (Dark Mode)

**Data:** 2026-08-26  
**Status:** ✅ Atualizado com design da referência

---

## 1. Gradiente e Acabamento dos Cards (Fiel à Imagem de Referência)

- **Cores & Iluminação (Dark Mode):**
  - **Fundo / Gradiente:** `linear-gradient(145deg, #232328 0%, #19191d 45%, #111114 100%)`
  - **Borda Geral:** `rgba(255, 255, 255, 0.08)` (1px fina e discreta)
  - **Borda Superior (Top Edge Highlight):** `rgba(255, 255, 255, 0.16)` (linha sutil de luz)
  - **Sombra:** `0 4px 20px -2px rgba(0, 0, 0, 0.6)`
  - **Cantos (Border Radius):** `rounded-xl` com contorno limpo e moderno.

- **Layout dos Cards de Serviço:**
  - **Topo:** Ícone em container arredondado escuro com tom dourado (`bg-amber-500/10 text-amber-500`) à esquerda e preço em destaque âmbar forte (`text-amber-500 font-extrabold text-lg`) à direita.
  - **Meio:** Título em destaque com tipografia encorpada (`text-foreground font-bold text-base`).
  - **Divisor:** Linha sutil separando o rodapé (`border-t border-border/40`).
  - **Rodapé:** Duração do serviço com ícone de relógio e ação `Agendar →` em dourado.

---

## 2. Breadcrumb no Painel (`app.localhost` / `/app`)

- **Componente:** `src/components/app/app-breadcrumb.tsx`
- **Integrado em:** `src/app/(app)/app/layout.tsx`
- Trilha dinâmica alinhada à esquerda com link para o Painel e badge com o nome da página ativa.

---

## 3. Alinhamento das Páginas à Esquerda

- Removido o centralizador `mx-auto` dos containers de todas as páginas do painel, garantindo alinhamento natural à esquerda junto da barra lateral.
