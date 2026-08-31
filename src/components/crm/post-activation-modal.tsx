"use client"

import * as React from "react"
import { CheckCircle2, QrCode, Copy, Check, ExternalLink, MessageCircle, X, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import QRCodeLib from "qrcode"

interface PostActivationModalProps {
  isOpen: boolean
  onClose: () => void
  clientName: string
  clientPhone: string
  activationUrl: string
  whatsappUrl: string
  whatsappMessage: string
}

export function PostActivationModal({
  isOpen,
  onClose,
  clientName,
  clientPhone,
  activationUrl,
  whatsappUrl,
  whatsappMessage,
}: PostActivationModalProps) {
  const [copied, setCopied] = React.useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = React.useState<string>("")
  const [showQrCode, setShowQrCode] = React.useState(false)

  React.useEffect(() => {
    if (activationUrl && isOpen) {
      QRCodeLib.toDataURL(activationUrl, {
        width: 250,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error("Erro ao gerar QR Code:", err))
    }
  }, [activationUrl, isOpen])

  if (!isOpen) return null

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activationUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7">
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Cabeçalho de Sucesso */}
        <div className="text-center flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-3 ring-8 ring-emerald-500/10">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            Cliente Cadastrado!
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xs">
            <strong className="text-foreground">{clientName}</strong> agora está na sua base e na rede de indicações.
          </p>
        </div>

        {/* Caixa de Ativação de Senha */}
        <div className="mt-6 p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-foreground">Ativação do Portal VIP</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Envie o link para o cliente criar sua própria senha e acompanhar agendamentos e seu saldo de indicações.
              </p>
            </div>
          </div>

          {/* QR Code Opcional */}
          {showQrCode ? (
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="QR Code de Ativação" className="w-48 h-48 rounded-lg" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-muted-foreground">
                  Gerando QR Code...
                </div>
              )}
              <p className="text-[11px] font-bold text-slate-800 mt-2">
                Aponte a câmera do celular para criar a senha
              </p>
            </div>
          ) : null}
        </div>

        {/* Ações Principais */}
        <div className="mt-5 space-y-2.5">
          {/* Botão Enviar WhatsApp */}
          <Button
            onClick={handleOpenWhatsApp}
            className="w-full h-12 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-lg shadow-[#25D366]/20 gap-2 flex items-center justify-center transition-all"
          >
            <MessageCircle className="h-5 w-5 fill-white text-[#25D366]" />
            <span>Enviar Link via WhatsApp</span>
          </Button>

          {/* Linha com Copiar Link e Alternar QR Code */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="h-10 rounded-xl text-xs font-semibold gap-1.5 border-border/70"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-muted-foreground" />
                  <span>Copiar Link</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowQrCode(!showQrCode)}
              className="h-10 rounded-xl text-xs font-semibold gap-1.5 border-border/70"
            >
              <QrCode className="h-4 w-4 text-muted-foreground" />
              <span>{showQrCode ? "Ocultar QR" : "Exibir QR Code"}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-xs text-muted-foreground hover:text-foreground h-9 rounded-xl"
          >
            Concluir e Voltar para a Lista
          </Button>
        </div>
      </div>
    </div>
  )
}
