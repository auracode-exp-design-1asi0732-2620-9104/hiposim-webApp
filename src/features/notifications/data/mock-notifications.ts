export type NotificationType = 'lead' | 'status' | 'system' | 'reminder'

export interface NotificationItem {
  id: string
  type: NotificationType
  date: string
  read: boolean
  title: string
  description?: string
  leadPreview?: { leadId: string; name: string; monthlyPayment: number; tcea: number }
  statusChange?: { from: string; to: string }
}

export const mockNotifications: NotificationItem[] = [
  {
    id: 'N-1',
    type: 'lead',
    date: '2026-09-19T10:48:00',
    read: false,
    title: 'Nuevo lead recibido',
    leadPreview: { leadId: 'L-2024-091', name: 'Mariana Flores Silva', monthlyPayment: 2410, tcea: 8.45 },
  },
  {
    id: 'N-2',
    type: 'lead',
    date: '2026-09-19T10:42:00',
    read: false,
    title: 'Nuevo lead recibido',
    leadPreview: { leadId: 'L-2024-089', name: 'Carlos Mendoza Paredes', monthlyPayment: 1890, tcea: 9.25 },
  },
  {
    id: 'N-3',
    type: 'reminder',
    date: '2026-09-19T09:50:00',
    read: false,
    title: '3 leads llevan más de 1 hora sin atender',
    description: 'Mariana Flores, Carlos Mendoza y un lead más siguen en estado "Nuevo". El SLA recomendado es de 30 minutos.',
  },
  {
    id: 'N-4',
    type: 'status',
    date: '2026-09-19T09:02:00',
    read: true,
    title: 'Lucía Alva Rospigliosi cambió de estado',
    statusChange: { from: 'Nuevo', to: 'Cita Agendada' },
  },
  {
    id: 'N-5',
    type: 'system',
    date: '2026-09-18T18:00:00',
    read: true,
    title: 'HipoSim actualizó las tasas de referencia',
    description: 'El Administrador actualizó la TEA referencial de BCP e Interbank. Las nuevas simulaciones ya reflejan el cambio.',
  },
  {
    id: 'N-6',
    type: 'status',
    date: '2026-09-18T16:40:00',
    read: true,
    title: 'Diego Paredes Gómez cambió de estado',
    statusChange: { from: 'En Contacto', to: 'Cerrado / Separación' },
  },
  {
    id: 'N-7',
    type: 'system',
    date: '2026-09-17T09:00:00',
    read: true,
    title: 'Nuevo rango del Bono del Buen Pagador vigente',
    description: 'El Fondo MIVIVIENDA actualizó los tramos de precio elegibles. Revisa el detalle en Reportes SBS.',
  },
]

export function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export function formatDayLabel(value: string) {
  const date = new Date(value)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  if (isSameDay(date, today)) return 'Hoy'
  if (isSameDay(date, yesterday)) return 'Ayer'
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'long' }).format(date)
}
