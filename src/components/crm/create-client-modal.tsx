"use client"

import * as React from "react"
import { Plus, X, User, Phone, Mail, Calendar, Sparkles, FileText, Check, Search, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClientAction, getPotentialSponsorsAction } from "@/actions/client-actions"

interface CreateClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (result: {
    client: any
    activationUrl: string
    whatsappUrl: string
    whatsappMessage: string
  }) => void
}

export function CreateClientModal({ isOpen, onClose, onSuccess }: CreateClientModalProps) {
  const [name, setName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [birthDate, setBirthDate] = React.useState("")
  const [notes, setNotes] = React.useState("")
  
  // Patrocinador / Indicação
  const [sponsorSearch, setSponsorSearch] = React.useState("")
  const [sponsorList, setSponsorList] = React.useState<Array<{ id: string; name: string | null; phone: string | null; referralCode: string | null }>>([])
  const [selectedSponsor, setSelectedSponsor] = React.useState<{ id: string; name: string | null; phone: string | null } | null>(null)
  const [isSearchingSponsor, setIsSearchingSponsor] = React.useState(false)

  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Máscara de Telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 11) value = value.slice(0, 11)
    
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2")
    }
    setPhone(value)
  }

  // Busca debounce de patrocinador
  React.useEffect(() => {
    if (!sponsorSearch || sponsorSearch.length < 2) {
      setSponsorList([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingSponsor(true)
      try {
        const results = await getPotentialSponsorsAction(sponsorSearch)
        setSponsorList(results)
      } catch (err) {
        console.error("Erro ao buscar patrocinadores:", err)
      } finally {
        setIsSearchingSponsor(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [sponsorSearch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !phone.trim()) {
      setError("Preencha ao menos o Nome e o WhatsApp do cliente.")
      return
    }

    setIsLoading(true)

    try {
      const result = await createClientAction({
        name: name.trim(),
        phone,
        email: email.trim() || undefined,
        birthDate: birthDate || undefined,
        notes: notes.trim() || undefined,
        sponsorId: selectedSponsor?.id || undefined,
      })

      if (result.success && result.client) {
        // Limpar formulário
        setName("")
        setPhone("")
        setEmail("")
        setBirthDate("")
        setNotes("")
        setSelectedSponsor(null)
        setSponsorSearch("")
        onClose()
        onSuccess({
          client: result.client,
          activationUrl: result.activationUrl || "",
          whatsappUrl: result.whatsappUrl || "",
          whatsappMessage: result.whatsappMessage || "",
        })
      } else {
        setError(result.error || "Ocorreu um erro ao cadastrar o cliente.")
      }
    } catch (err: any) {
      setError(err?.message || "Falha na conexão.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Novo Cadastro no Balcão
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cadastre o cliente e gere o link de ativação com o programa de indicação.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nome e WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Nome Completo *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Silva"
                  className="pl-9 h-10 rounded-xl text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">WhatsApp *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  className="pl-9 h-10 rounded-xl text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* E-mail e Aniversário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">E-mail (opcional)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos@email.com"
                  className="pl-9 h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Data de Nascimento (opcional)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="pl-9 h-10 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Indicação / Patrocinador Multinível */}
          <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <label className="text-xs font-bold text-foreground">Veio por indicação de alguém?</label>
            </div>
            
            {selectedSponsor ? (
              <div className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-primary/30">
                <div className="text-xs">
                  <span className="font-bold text-foreground">{selectedSponsor.name}</span>
                  <span className="text-muted-foreground text-[11px] block">{selectedSponsor.phone}</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedSponsor(null)}
                  className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                >
                  Remover
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={sponsorSearch}
                  onChange={(e) => setSponsorSearch(e.target.value)}
                  placeholder="Buscar amigo por nome ou WhatsApp..."
                  className="pl-9 h-10 rounded-xl text-xs bg-background"
                />
                {isSearchingSponsor && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                )}

                {/* Dropdown de Resultados */}
                {sponsorList.length > 0 && (
                  <div className="absolute top-full mt-1.5 left-0 right-0 z-20 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                    {sponsorList.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedSponsor({ id: s.id, name: s.name, phone: s.phone })
                          setSponsorSearch("")
                          setSponsorList([])
                        }}
                        className="w-full text-left p-2.5 hover:bg-muted text-xs flex items-center justify-between border-b last:border-b-0"
                      >
                        <div>
                          <strong className="text-foreground block">{s.name || "Sem nome"}</strong>
                          <span className="text-muted-foreground text-[11px]">{s.phone || s.referralCode}</span>
                        </div>
                        <Plus className="h-3.5 w-3.5 text-primary" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!selectedSponsor && (
              <p className="text-[11px] text-muted-foreground">
                Se deixar em branco, o sistema vinculará automaticamente ao <strong>Indicador Padrão da casa</strong>.
              </p>
            )}
          </div>

          {/* Anotações */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Anotações</label>
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Preferências, observações de atendimento, alergias ou detalhes importantes..."
                rows={2}
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
        </form>

        {/* Rodapé com Ações */}
        <div className="pt-4 border-t border-border/50 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="h-10 text-xs rounded-xl"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="h-10 px-5 text-xs font-bold rounded-xl bg-primary text-primary-foreground gap-1.5 shadow-md shadow-primary/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cadastrando...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Salvar & Gerar Link VIP</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
