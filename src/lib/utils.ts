import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function getStatusColor(status: string): string {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    paid: 'bg-emerald-100 text-emerald-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export function getStatusText(status: string): string {
  const texts = {
    pending: 'Pendiente',
    processing: 'En Proceso',
    ready: 'Listo',
    completed: 'Completado',
    cancelled: 'Cancelado',
    paid: 'Pagado',
    active: 'Activo',
    inactive: 'Inactivo',
    suspended: 'Suspendido',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  }
  return texts[status as keyof typeof texts] || status
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
} 