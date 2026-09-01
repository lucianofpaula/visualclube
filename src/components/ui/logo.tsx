import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg" | "xl" | number
  className?: string
}

export function LogoIcon({ size = "md", className, ...props }: LogoIconProps) {
  let dimension = 36
  if (typeof size === "number") {
    dimension = size
  } else {
    switch (size) {
      case "sm":
        dimension = 28
        break
      case "md":
        dimension = 38
        break
      case "lg":
        dimension = 48
        break
      case "xl":
        dimension = 64
        break
    }
  }

  const idSuffix = React.useId().replace(/:/g, "")

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 transition-transform duration-300", className)}
      {...props}
    >
      <defs>
        {/* Gradiente Principal do V (Violeta -> Índigo -> Esmeralda/Ciano) */}
        <linearGradient
          id={`vcGradMain_${idSuffix}`}
          x1="6"
          y1="8"
          x2="42"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="35%" stopColor="#6366F1" />
          <stop offset="70%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Gradiente Secundário do Traço Fluido e Brilho */}
        <linearGradient
          id={`vcGradGlow_${idSuffix}`}
          x1="20"
          y1="6"
          x2="44"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>

        {/* Sombra Suave & Glow */}
        <filter id={`vcShadow_${idSuffix}`} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#6366F1" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Traço Esquerdo do V (Curva fluida e dinâmica) */}
      <path
        d="M9 14.5C9 14.5 13.5 13 16 17L23.5 35.5C24.3 37.5 27.2 37.5 28 35.5L34 21C34.8 19 33.5 17 31.5 17C29 17 26.5 23 24.5 28L22 22L16 9C14.5 6 9 8 9 14.5Z"
        fill={`url(#vcGradMain_${idSuffix})`}
        opacity="0.95"
      />

      {/* Traço Direito Fluido em Asa/Fita Ascendente */}
      <path
        d="M23.5 36.5C22.8 38 20.8 38.5 19.5 37.5C18.2 36.5 18 34.5 19 33L27.5 16C29.5 12 34 10.5 38 12.5C41.5 14.2 40.5 18.5 36.5 20C31 22 27 28 23.5 36.5Z"
        fill={`url(#vcGradGlow_${idSuffix})`}
        filter={`url(#vcShadow_${idSuffix})`}
      />

      {/* Estrela / Brilho de 4 pontas no topo do traço fluido */}
      <g transform="translate(37.5, 11.5)">
        <path
          d="M0 -5C0.3 -2 2 -0.3 5 0C2 0.3 0.3 2 0 5C-0.3 2 -2 0.3 -5 0C-2 -0.3 -0.3 -2 0 -5Z"
          fill="#34D399"
        />
        <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" />
      </g>

      {/* Ponto de luz interno decorativo */}
      <circle cx="21" cy="27" r="1.5" fill="#A78BFA" opacity="0.8" />
    </svg>
  )
}

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  showBadge?: boolean
  badgeText?: string
  subtitle?: string
  href?: string
  className?: string
}

export function Logo({
  size = "md",
  showText = true,
  showBadge = true,
  badgeText = "PRO",
  subtitle,
  href,
  className,
}: LogoProps) {
  const content = (
    <div className={cn("inline-flex items-center gap-3 group select-none", className)}>
      {/* Símbolo com fundo sutil e glow ao passar o mouse */}
      <div className="relative flex items-center justify-center rounded-2xl p-1.5 bg-gradient-to-br from-background via-muted/50 to-background border border-border/60 shadow-sm group-hover:border-indigo-500/40 group-hover:shadow-indigo-500/10 group-hover:shadow-lg transition-all duration-300">
        <LogoIcon size={size} className="group-hover:scale-105 transition-transform" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={cn(
                "font-black tracking-tight text-foreground transition-colors",
                size === "sm" && "text-base",
                size === "md" && "text-xl",
                size === "lg" && "text-2xl",
                size === "xl" && "text-3xl"
              )}
            >
              Visual<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-500">Clube</span>
            </span>

            {showBadge && (
              <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {badgeText}
              </span>
            )}
          </div>

          {subtitle && (
            <span className="text-[11px] text-muted-foreground font-medium mt-0.5 hidden sm:block leading-tight">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    )
  }

  return content
}
