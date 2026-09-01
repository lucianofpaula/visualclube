"use client"

import * as React from "react"
import { 
  Heart, 
  MessageCircle, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  Globe, 
  Share2,
  MapPin
} from "lucide-react"
import { Logo } from "@/components/ui/logo"

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/60 backdrop-blur-md pt-16 pb-12 text-muted-foreground text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-border/60">
          {/* Col 1: Brand */}
          <div className="col-span-2 space-y-4">
            <Logo size="sm" showBadge={false} />

            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              A plataforma inteligente para barbearias, salões de beleza, esmalterias e clínicas de estética que buscam agilidade, faturamento previsível e gestão financeira sem dor de cabeça.
            </p>

            <div className="flex items-center gap-3 text-muted-foreground pt-1">
              <a href="https://visualclube.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>visualclube.com.br</span>
              </a>
              <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 p-1.5 rounded-lg hover:bg-muted transition-colors flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Col 2: Segmentos */}
          <div className="space-y-3">
            <div className="font-bold text-foreground text-xs uppercase tracking-wider">
              Segmentos
            </div>
            <ul className="space-y-2">
              <li><a href="#segmentos" className="hover:text-foreground transition-colors">Barbearias</a></li>
              <li><a href="#segmentos" className="hover:text-foreground transition-colors">Salões de Beleza</a></li>
              <li><a href="#segmentos" className="hover:text-foreground transition-colors">Esmalterias & Nail</a></li>
              <li><a href="#segmentos" className="hover:text-foreground transition-colors">Clínicas de Estética</a></li>
              <li><a href="#segmentos" className="hover:text-foreground transition-colors">Spas & Massoterapia</a></li>
            </ul>
          </div>

          {/* Col 3: Módulos */}
          <div className="space-y-3">
            <div className="font-bold text-foreground text-xs uppercase tracking-wider">
              Recursos
            </div>
            <ul className="space-y-2">
              <li><a href="#recursos" className="hover:text-foreground transition-colors">Agendamento Online 24/7</a></li>
              <li><a href="#comandas" className="hover:text-foreground transition-colors">Comandas Digitais</a></li>
              <li><a href="#recursos" className="hover:text-foreground transition-colors">Robô de WhatsApp</a></li>
              <li><a href="#recursos" className="hover:text-foreground transition-colors">Divisão de Comissões</a></li>
              <li><a href="#recursos" className="hover:text-foreground transition-colors">Clube de Assinaturas</a></li>
            </ul>
          </div>

          {/* Col 4: Suporte & Legal */}
          <div className="space-y-3">
            <div className="font-bold text-foreground text-xs uppercase tracking-wider">
              Suporte & Legal
            </div>
            <ul className="space-y-2">
              <li><a href="#faq" className="hover:text-foreground transition-colors">Central de Ajuda (FAQ)</a></li>
              <li><a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">WhatsApp Suporte</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Segurança de Dados (LGPD)</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} VisualClube Tecnologia Ltda. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Desenvolvido com carinho para o setor de beleza e estética</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  )
}
