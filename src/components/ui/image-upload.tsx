"use client";

import * as React from "react";
import { useState, useRef, useTransition } from "react";
import { Upload, Camera, Trash2, Loader2, CheckCircle2, AlertCircle, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImageAction } from "@/actions/upload";
import { cn } from "@/lib/utils";

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  description?: string;
  aspectRatio?: "square" | "banner";
  disabled?: boolean;
  className?: string;
}

async function compressImage(file: File, maxDimension = 1920, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= 1024 * 1024) {
    return file;
  }
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(file);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
          } else {
            const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressed);
          }
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export function ImageUpload({
  value,
  onChange,
  folder = "visualclube",
  label,
  description = "PNG, JPG ou WEBP até 15MB",
  aspectRatio = "square",
  disabled = false,
  className,
}: ImageUploadProps) {
  const [isPending, startTransition] = useTransition();
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMessage(null);

    // Validações locais rápidas
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Por favor, selecione apenas arquivos de imagem.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("O arquivo é muito grande. O tamanho máximo permitido é 15MB.");
      return;
    }

    startTransition(async () => {
      const processedFile = await compressImage(file);
      const formData = new FormData();
      formData.append("file", processedFile);
      formData.append("folder", folder);

      const result = await uploadImageAction(formData);

      if (result.success && result.url) {
        onChange(result.url);
        setManualUrl(result.url);
      } else {
        setErrorMessage(result.error || "Erro ao realizar o upload da imagem.");
      }
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange("");
    setManualUrl("");
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleManualUrlSave = () => {
    onChange(manualUrl.trim());
    setShowUrlInput(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isPending}
      />

      {value ? (
        /* Estado com imagem já enviada */
        <div className="flex items-center gap-3 p-3 rounded-sm border border-border bg-card">
          <div
            className={cn(
              "relative overflow-hidden rounded-sm border border-border bg-muted flex items-center justify-center shrink-0",
              aspectRatio === "square" ? "h-16 w-16" : "h-16 w-32"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Prévia"
              className="h-full w-full object-cover"
              onError={() => {
                setErrorMessage("Falha ao carregar a prévia da imagem.");
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              Imagem Carregada
            </p>
            <p className="text-[11px] text-muted-foreground truncate font-mono">
              {value}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isPending}
                className="h-7 text-xs rounded-sm gap-1"
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Upload className="h-3 w-3" />
                )}
                Trocar Foto
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isPending}
                className="h-7 text-xs rounded-sm text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Remover
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone para envio */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isPending && fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center p-4 border border-dashed rounded-sm cursor-pointer transition-all text-center",
            dragActive
              ? "border-amber-500 bg-amber-500/10"
              : "border-border hover:border-amber-500/50 bg-muted/20 hover:bg-muted/40",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          {isPending ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              <p className="text-xs font-medium text-foreground">
                Enviando foto para o Cloudinary...
              </p>
              <p className="text-[10px] text-muted-foreground">
                Aguarde alguns instantes
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-1">
              <div className="h-9 w-9 rounded-sm bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Camera className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                    Clique para enviar
                  </span>{" "}
                  ou arraste uma imagem aqui
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {description}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Opção secundária: Inserir Link Manualmente */}
      <div className="flex items-center justify-between text-[11px] pt-0.5">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <LinkIcon className="h-3 w-3" />
          {showUrlInput ? "Ocultar link manual" : "Ou colar URL direta da imagem"}
        </button>

        {value && (
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Foto vinculada
          </span>
        )}
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
          <Input
            placeholder="https://res.cloudinary.com/..."
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="h-8 text-xs font-mono"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleManualUrlSave}
            className="h-8 text-xs rounded-sm shrink-0"
          >
            Aplicar URL
          </Button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-destructive pt-0.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
