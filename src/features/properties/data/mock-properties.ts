export type ProjectStatus = 'Activo' | 'En Preventa' | 'Agotado'

export interface Project {
  id: string
  name: string
  district: string
  status: ProjectStatus
  priceFrom: number
  priceTo: number
  totalUnits: number
  availableUnits: number
  deliveryDate: string
  leadsCount: number
  accentFrom: string
  accentTo: string
}

export const mockProjects: Project[] = [
  {
    id: 'PRJ-01',
    name: 'Park Prado',
    district: 'Jesús María',
    status: 'Activo',
    priceFrom: 269000,
    priceTo: 385000,
    totalUnits: 84,
    availableUnits: 21,
    deliveryDate: 'Entrega inmediata',
    leadsCount: 3,
    accentFrom: '#0E5C63',
    accentTo: '#3AAFA9',
  },
  {
    id: 'PRJ-02',
    name: 'Residencial San Felipe II',
    district: 'Jesús María',
    status: 'En Preventa',
    priceFrom: 249000,
    priceTo: 310000,
    totalUnits: 60,
    availableUnits: 44,
    deliveryDate: 'Entrega en 8 meses',
    leadsCount: 2,
    accentFrom: '#3AAFA9',
    accentTo: '#0E5C63',
  },
  {
    id: 'PRJ-03',
    name: 'Torre B — Jesús María',
    district: 'Jesús María',
    status: 'Agotado',
    priceFrom: 340000,
    priceTo: 360000,
    totalUnits: 32,
    availableUnits: 0,
    deliveryDate: 'Entregado',
    leadsCount: 1,
    accentFrom: '#5F6B76',
    accentTo: '#1F2933',
  },
  {
    id: 'PRJ-04',
    name: 'Condominio Los Fresnos',
    district: 'La Molina',
    status: 'Activo',
    priceFrom: 320000,
    priceTo: 410000,
    totalUnits: 48,
    availableUnits: 12,
    deliveryDate: 'Entrega en 3 meses',
    leadsCount: 1,
    accentFrom: '#F5A524',
    accentTo: '#0E5C63',
  },
]

export interface Advisor {
  id: string
  name: string
  role: string
  leadsAssigned: number
  activeSince: string
}

export const mockAdvisors: Advisor[] = [
  { id: 'ADV-1', name: 'Valeria Torres', role: 'Asesora Senior Hipotecaria', leadsAssigned: 24, activeSince: '2023' },
  { id: 'ADV-2', name: 'Renzo Ibarra', role: 'Asesor Comercial', leadsAssigned: 16, activeSince: '2024' },
  { id: 'ADV-3', name: 'Camila Ríos', role: 'Asesora Comercial', leadsAssigned: 8, activeSince: '2025' },
]

export function formatProjectPrice(value: number) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(value)
}
