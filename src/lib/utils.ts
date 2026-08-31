import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata e detecta dinamicamente se o identificador digitado é um Telefone/WhatsApp ou E-mail.
 * Aplica máscara de telefone (DD) 99999-9999 caso o usuário digite números, ou mantém texto puro para e-mail.
 */
export function formatSmartIdentifier(value: string) {
  const trimmed = value.trim()
  const hasLetters = /[a-zA-Z]/.test(trimmed)
  const hasAt = trimmed.includes("@")
  const digits = trimmed.replace(/\D/g, "")

  // Se tem arroba ou começou com letras, é e-mail
  if (hasAt || (hasLetters && digits.length < 3)) {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
    return {
      formatted: value,
      isPhone: false,
      isEmail: true,
      isValid: isValidEmail,
      type: "email" as const,
    }
  }

  // Se contém números e não tem letras, aplica máscara brasileira de telefone
  if (digits.length > 0) {
    let phoneFormatted = ""
    if (digits.length <= 2) {
      phoneFormatted = `(${digits}`
    } else if (digits.length <= 6) {
      phoneFormatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    } else if (digits.length <= 10) {
      phoneFormatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`
    } else {
      phoneFormatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
    }

    const isValidPhone = digits.length === 10 || digits.length === 11

    return {
      formatted: phoneFormatted,
      isPhone: true,
      isEmail: false,
      isValid: isValidPhone,
      type: "phone" as const,
    }
  }

  return {
    formatted: value,
    isPhone: false,
    isEmail: false,
    isValid: false,
    type: "none" as const,
  }
}
