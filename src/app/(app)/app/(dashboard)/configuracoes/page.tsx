"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Building2, 
  Store, 
  Sparkles, 
  CheckCircle2, 
  Save, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  Plus,
  ArrowRight,
  User,
  ShieldCheck,
  Camera,
  Palette,
  SunMoon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useSubscription } from "@/components/app/app-shell"
import { updateBusiness, checkSlugAvailability } from "@/actions/business-actions"
import { updateUserAvatarAction, updateUserProfileAction } from "@/actions/upload-actions"
import { AvatarUploader } from "@/components/ui/avatar-uploader"
import { ThemePicker } from "@/components/theme-picker"
import { ThemeToggle } from "@/components/theme-toggle"
import { useColorTheme, ColorThemeId, normalizeThemeId } from "@/components/theme-manager"

export default function ConfiguracoesPage() {
  const { hasBusiness, business, currentUser } = useSubscription()

  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // User Profile Form State
  const [userName, setUserName] = useState("")
  const [userPhone, setUserPhone] = useState("")
  const [userAvatar, setUserAvatar] = useState("")
  const [savingUser, setSavingUser] = useState(false)
  const [userSuccessMsg, setUserSuccessMsg] = useState<string | null>(null)

  const { colorTheme, setColorTheme } = useColorTheme()

  // Business Form State
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [document, setDocument] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [themeColor, setThemeColor] = useState<ColorThemeId>("emerald")
  const [websiteUrl, setWebsiteUrl] = useState("")

  // Carrega dados do usuário
  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.name || "")
      setUserPhone(currentUser.phone || "")
      setUserAvatar(currentUser.image || "")
    }
  }, [currentUser])

  // Carrega dados do negócio se existirem
  useEffect(() => {
    if (business) {
      setName(business.name || "")
      setSlug(business.slug || "")
      setPhone(business.phone || "")
      setEmail(business.email || "")
      setDocument(business.document || "")
      setDescription(business.description || "")
      setAddress(business.address || "")
      setNeighborhood(business.neighborhood || "")
      setCity(business.city || "")
      setState(business.state || "")
      setPostalCode(business.postalCode || "")
      
      const savedTheme = typeof window !== "undefined" ? localStorage.getItem("cluberize_color_theme") : null
      const initialTheme = normalizeThemeId(savedTheme || business.themeColor)
      setThemeColor(initialTheme)
      setColorTheme(initialTheme)

      if (business.slug) {
        const isLocal = typeof window !== "undefined" && window.location.hostname.includes("localhost")
        setWebsiteUrl(
          isLocal
            ? `http://${business.slug}.localhost:3000`
            : `https://${business.slug}.visualclube.com.br`
        )
      }
    }
  }, [business])

  const handleSelectTheme = async (newTheme: ColorThemeId) => {
    setThemeColor(newTheme)
    setColorTheme(newTheme)
    
    // Auto-salva imediatamente no banco para persistir
    if (business?.id) {
      try {
        await updateBusiness(business.id, { themeColor: newTheme })
      } catch (err) {
        console.error("Erro ao auto-salvar tema:", err)
      }
    }
  }

  // Salvar Perfil do Usuário
  const handleSaveUserProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingUser(true)
    setUserSuccessMsg(null)

    try {
      const res = await updateUserProfileAction({
        name: userName,
        phone: userPhone,
        image: userAvatar,
      })

      if (res.success) {
        setUserSuccessMsg("Perfil pessoal atualizado com sucesso!")
        setTimeout(() => setUserSuccessMsg(null), 4000)
      } else {
        setError(res.error || "Falha ao salvar dados do perfil.")
      }
    } catch (err: any) {
      setError("Erro ao salvar perfil pessoal.")
    } finally {
      setSavingUser(false)
    }
  }

  // Salvar Estabelecimento
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business?.id) return

    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await updateBusiness(business.id, {
        name,
        slug,
        phone,
        email,
        document,
        description,
        address,
        neighborhood,
        city,
        state,
        postalCode,
        themeColor,
      })

      if (!res.success) {
        setError(res.error || "Falha ao atualizar dados.")
      } else {
        setSuccessMsg("Dados do estabelecimento atualizados com sucesso!")
        setTimeout(() => setSuccessMsg(null), 4000)
      }
    } catch (err: any) {
      setError("Erro inesperado ao salvar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Cabeçalho Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 border-primary/30 text-primary bg-primary/5 font-bold">
              <User className="h-3 w-3 mr-1" />
              Meu Perfil & Estabelecimento
            </Badge>
            {hasBusiness && <Badge variant="success" className="text-[10px] px-2">Espaço Ativo</Badge>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            Configurações da Conta
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gerencie sua foto de perfil, dados pessoais e configurações completas do seu estabelecimento.
          </p>
        </div>

        {business?.slug && (
          <a
            href={websiteUrl || `/b/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors shrink-0"
          >
            <span>Ver Website Oficial</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* SEÇÃO 1: PERFIL PESSOAL & FOTO DO GESTOR */}
      <Card className="rounded-3xl border-border/70 bg-card/90 backdrop-blur-md shadow-lg overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-base font-extrabold flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            1. Meu Perfil de Usuário & Foto (Gestor)
          </CardTitle>
          <CardDescription className="text-xs">
            Sua foto é armazenada no Cloudinary e será exibida no cabeçalho do sistema e nas interações.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {userSuccessMsg && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in-50">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{userSuccessMsg}</span>
            </div>
          )}

          {/* Uploader de Avatar com Cloudinary */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-4 rounded-2xl bg-muted/30 border border-border/50">
            <AvatarUploader
              currentImageUrl={userAvatar || currentUser?.image}
              name={userName || currentUser?.name || "Gestor"}
              size="xl"
              onUploadSuccess={async (url) => {
                setUserAvatar(url)
                await updateUserAvatarAction(url)
                setUserSuccessMsg("Foto de perfil atualizada no Cloudinary com sucesso!")
                setTimeout(() => setUserSuccessMsg(null), 4000)
              }}
              onRemove={async () => {
                setUserAvatar("")
                await updateUserAvatarAction("")
              }}
            />

            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-extrabold text-sm text-foreground">
                {userName || "Seu Nome"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {currentUser?.email || "Sem e-mail cadastrado"}
              </p>
              <div className="pt-2">
                <Badge variant="outline" className="text-[10px] font-bold border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/5">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Cargo: {currentUser?.role || "OWNER"}
                </Badge>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveUserProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Nome Completo</label>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">WhatsApp Pessoal</label>
                <Input
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="Seu WhatsApp"
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={savingUser}
                size="sm"
                className="bg-primary text-primary-foreground font-bold text-xs h-10 px-5 rounded-xl shadow-xs gap-1.5"
              >
                {savingUser ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Salvar Dados Pessoais</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* SEÇÃO 2: DADOS DO ESTABELECIMENTO */}
      {hasBusiness ? (
        <div className="space-y-6">
          <div className="border-b border-border/50 pb-2">
            <h2 className="text-lg font-black text-foreground flex items-center gap-2">
              <Store className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>2. Dados do Estabelecimento</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Configurações públicas, canais de atendimento e endereço do espaço.
            </p>
          </div>

          {successMsg && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in-50">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-bold text-destructive flex items-center gap-2 animate-in fade-in-50">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Card 1: Informações Gerais */}
            <Card className="rounded-3xl border-border/70 bg-card/80 backdrop-blur-md shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  Identidade & Link da Bio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Nome Comercial</label>
                    <Input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span>Subdomínio & Link da Bio (Slug)</span>
                      {slug && (
                        <span className="text-[10px] text-primary font-semibold truncate max-w-[200px]">
                          {slug}.visualclube.com.br
                        </span>
                      )}
                    </label>
                    <div className="flex items-center rounded-xl border border-border/70 bg-muted/30 px-3 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
                      <input
                        required
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="barbeariadoluciano"
                        className="w-full bg-transparent py-2.5 text-xs font-bold text-foreground focus:outline-hidden"
                      />
                      <span className="text-xs font-semibold text-muted-foreground select-none shrink-0">
                        .visualclube.com.br
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-foreground">Descrição / Slogan</label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Breve descrição do seu espaço"
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card: Tema Visual & Identidade (60-30-10) */}
            <Card className="rounded-3xl border-border/70 bg-card/80 backdrop-blur-md shadow-md">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-extrabold flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      Tema do Sistema & Identidade Visual
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Escolha uma das 5 paletas pré-configuradas seguindo a regra 60-30-10. Aplicado ao seu painel e link público.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs text-muted-foreground font-semibold">Modo:</span>
                    <ThemeToggle variant="pills" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ThemePicker
                  currentTheme={themeColor}
                  onSelectTheme={handleSelectTheme}
                />
              </CardContent>
            </Card>

            {/* Card 2: Contatos */}
            <Card className="rounded-3xl border-border/70 bg-card/80 backdrop-blur-md shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Contato & Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">WhatsApp Oficial</label>
                    <Input
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">E-mail de Contato</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-foreground">CNPJ ou CPF</label>
                    <Input
                      value={document}
                      onChange={(e) => setDocument(e.target.value)}
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Localização & Endereço */}
            <Card className="rounded-3xl border-border/70 bg-card/80 backdrop-blur-md shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-500" />
                  Localização & Endereço
                </CardTitle>
                <CardDescription className="text-xs">
                  Endereço exibido no seu Website Premium e nas mensagens de agendamento.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="space-y-1.5 sm:col-span-8">
                    <label className="text-xs font-bold text-foreground">Logradouro / Rua e Número</label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex: Rua Laurinda, 129"
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-4">
                    <label className="text-xs font-bold text-foreground">Bairro</label>
                    <Input
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Ex: Centro"
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-8">
                    <label className="text-xs font-bold text-foreground">Cidade</label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: Rio de Janeiro"
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-4">
                    <label className="text-xs font-bold text-foreground">Estado (UF)</label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      placeholder="RJ"
                      maxLength={2}
                      className="h-11 rounded-xl text-sm uppercase text-center"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botão de Salvar */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground font-bold text-sm h-12 px-8 rounded-2xl shadow-md gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Salvando Alterações...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Salvar Dados do Estabelecimento</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        /* Se ainda não tem espaço */
        <Card className="rounded-3xl border-border/80 bg-card/80 p-8 sm:p-10 text-center shadow-xl backdrop-blur-md space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Store className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-foreground">Nenhum Estabelecimento Vinculado</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Cadastre seu espaço para gerenciar endereço, horários de funcionamento e catálogo.
            </p>
          </div>
          <Link href="/app/meu-negocio/criar">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-xs gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Cadastrar Meu Espaço</span>
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
