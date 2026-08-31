"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { Camera, Loader2, UploadCloud, X, Check, User } from "lucide-react"
import { uploadImageAction } from "@/actions/upload-actions"
import { cn } from "@/lib/utils"

interface AvatarUploaderProps {
  currentImageUrl?: string | null
  name?: string
  onUploadSuccess: (url: string) => Promise<void> | void
  onRemove?: () => Promise<void> | void
  folder?: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function AvatarUploader({
  currentImageUrl,
  name = "Usuário",
  onUploadSuccess,
  onRemove,
  folder = "visualclube/avatars",
  className,
  size = "lg",
}: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "VC"

  const sizeClasses = {
    sm: "h-16 w-16 text-sm",
    md: "h-20 w-20 text-base",
    lg: "h-28 w-28 text-xl",
    xl: "h-36 w-36 text-2xl",
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview local imediato
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
    setIsUploading(true)
    setFeedback(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await uploadImageAction(formData, folder)

      if (res.success && res.url) {
        setPreviewUrl(res.url)
        await onUploadSuccess(res.url)
        setFeedback({ type: "success", text: "Foto atualizada com sucesso!" })
        setTimeout(() => setFeedback(null), 3500)
      } else {
        setPreviewUrl(null)
        setFeedback({ type: "error", text: res.error || "Falha no upload da foto." })
      }
    } catch (err: any) {
      console.error("Erro ao enviar foto:", err)
      setPreviewUrl(null)
      setFeedback({ type: "error", text: "Erro ao enviar imagem." })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const displayImage = previewUrl || currentImageUrl

  return (
    <div className={cn("flex flex-col items-center sm:items-start gap-3", className)}>
      <div className="flex items-center gap-4">
        {/* Avatar Container */}
        <div className="relative group">
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={cn(
              "relative rounded-3xl overflow-hidden cursor-pointer border-2 border-border/80 group-hover:border-primary transition-all duration-200 shadow-md flex items-center justify-center bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black select-none",
              sizeClasses[size],
              isUploading && "pointer-events-none opacity-80"
            )}
          >
            {displayImage ? (
              <img
                src={displayImage}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span>{initials}</span>
            )}

            {/* Overlay Hover com Ícone de Câmera */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 p-2 text-center">
              <Camera className="h-5 w-5" />
              <span className="text-[10px] font-bold leading-tight">Alterar foto</span>
            </div>

            {/* Spinner de Upload */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-1">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-[9px] font-bold">Enviando...</span>
              </div>
            )}
          </div>

          {/* Botão de Câmera Flutuante */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground border-2 border-background flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
            title="Alterar foto"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        {/* Input Oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Textos de Instrução & Botões de Ação */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold transition-all"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>{displayImage ? "Trocar Foto" : "Enviar Foto"}</span>
            </button>

            {displayImage && onRemove && (
              <button
                type="button"
                onClick={async () => {
                  setPreviewUrl(null)
                  await onRemove()
                }}
                disabled={isUploading}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-muted transition-all"
              >
                <X className="h-3.5 w-3.5" />
                <span>Remover</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Formatos suportados: JPG, PNG ou WEBP. Máx. 8MB. Otimizado com Cloudinary.
          </p>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={cn(
            "text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl animate-in fade-in duration-200",
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          )}
        >
          {feedback.type === "success" ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          <span>{feedback.text}</span>
        </div>
      )}
    </div>
  )
}
