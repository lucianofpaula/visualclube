export type AgendaViewMode = "day" | "week"

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED"
  | "NO_SHOW"

export interface Barber {
  id: string
  name: string
  avatar?: string | null
  avatarUrl?: string | null
  specialty?: string
  colorHex?: string
  themeColor?: string
  phone?: string | null
  isAvailable?: boolean
}

export interface ServiceItem {
  id: string
  name: string
  price: number
  durationMinutes: number
  category?: string
}

export interface CustomerInfo {
  id: string
  name: string
  phone: string
  email?: string | null
  avatar?: string | null
  image?: string | null
  isClubMember?: boolean
  clubPlanName?: string | null
}

export interface Appointment {
  id: string
  customer: CustomerInfo
  barberId: string
  professionalId: string
  professionalName: string
  professionalAvatar?: string | null
  professionalColor?: string
  services: ServiceItem[]
  date: string // "YYYY-MM-DD"
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  status: AppointmentStatus
  totalPrice: number
  notes?: string | null
  comandaId?: string | null
  orderId?: string | null
  createdVia?: "DASHBOARD" | "ONLINE" | "WHATSAPP"
}

export interface TimeBlock {
  id: string
  barberId?: string | null
  professionalId?: string | null
  professionalName?: string
  date: string // "YYYY-MM-DD"
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  reason: string
}

export interface BusinessHours {
  dayOfWeek: number
  isOpen: boolean
  openTime: string
  closeTime: string
  slotIntervalMinutes?: number
}
