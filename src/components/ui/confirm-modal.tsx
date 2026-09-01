"use client"

import * as React from "react"
import { useState } from "react"
import { AlertTriangle, Trash2, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "warning" | "default"
  icon?: React.ReactNode
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "destructive",
  icon,
  isLoading = false,
}: ConfirmModalProps) {
  const [internalLoading, setInternalLoading] = useState(false)

  if (!isOpen) return null

  const loading = isLoading || internalLoading

  const handleConfirm = async () => {
    try {
      setInternalLoading(true)
      await onConfirm()
    } finally {
      setInternalLoading(false)
    }
  }

  const getIcon = () => {
    if (icon) return icon
    if (variant === "destructive") {
      return <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
    }
    if (variant === "warning") {
      return <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
    }
    return <AlertCircle className="h-6 w-6 text-primary" />
  }

  const getIconBg = () => {
    if (variant === "destructive") {
      return "bg-rose-500/10 border-rose-500/20"
    }
    if (variant === "warning") {
      return "bg-amber-500/10 border-amber-500/20"
    }
    return "bg-primary/10 border-primary/20"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border shrink-0 ${getIconBg()}`}>
              {getIcon()}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {typeof description === "string" ? description : description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="pt-3 border-t border-border/50 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="text-xs h-10 rounded-xl font-bold px-4 cursor-pointer"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`text-xs h-10 rounded-xl font-black px-5 shadow-sm cursor-pointer ${
              variant === "destructive"
                ? "bg-rose-600 hover:bg-rose-500 text-white"
                : variant === "warning"
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {loading ? "Processando..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
