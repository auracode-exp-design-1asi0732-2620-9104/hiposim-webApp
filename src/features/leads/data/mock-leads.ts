export type LeadStatus = 'nuevo' | 'contactado' | 'cita' | 'en_proceso' | 'cerrado'

export interface LeadActivity {
  id: string
  date: string
  title: string
  description: string
  type: 'completed' | 'pending'
}

export interface MatchedProperty {
  id: string
  name: string
  address: string
  areaM2: number
  rooms: number
  baths: number
  price: number
  match: number
  deliveryStatus: string
  appliesToMivivienda: boolean
  recommended: boolean
}

export interface Lead {
  id: string
  name: string
  dni: string
  dniValidatedSbs: boolean
  age: number
  phone: string
  email: string
  requestType: 'Individual' | 'Conyugal / Mancomunado'
  coApplicantName?: string
  occupation: string
  employmentRegime: string
  status: LeadStatus
  createdAt: string
  originDistrict: string
  originProject: string
  assignedAdvisor: string
  financialCapacity: {
    netIncome: number
    dtiRatio: number
    dtiMax: number
    dtiStatus: 'Saludable' | 'Ajustado' | 'En riesgo'
    incomeSupport: string
    maxApprovablePayment: number
    paymentHeadroom: number
    creditScoreLabel: string
  }
  simulation: {
    certificateId: string
    propertyType: string
    district: string
    propertyPrice: number
    downPaymentAmount: number
    downPaymentPct: number
    financingAmount: number
    termYears: number
    monthlyPayment: number
    tcea: number
    marketTcea: number
    bank: string
    bbpApplied: boolean
    bbpAmount?: number
    effectiveInitialPct: number
    effectiveInitialAmount: number
  }
  matchedProperties: MatchedProperty[]
  activity: LeadActivity[]
}

export const statusLabels: Record<LeadStatus, string> = {
  nuevo: 'NUEVO (Sin atender)',
  contactado: 'EN CONTACTO',
  cita: 'CITA AGENDADA',
  en_proceso: 'EN PROCESO',
  cerrado: 'CERRADO / SEPARACIÓN',
}

export const statusSeverity: Record<LeadStatus, 'success' | 'info' | 'warn' | 'secondary'> = {
  nuevo: 'warn',
  contactado: 'info',
  cita: 'info',
  en_proceso: 'info',
  cerrado: 'success',
}

export const mockLeads: Lead[] = [
  {
    id: 'L-2024-091',
    name: 'Mariana Flores Silva',
    dni: '47••••821',
    dniValidatedSbs: true,
    age: 29,
    phone: '+51 984 312 884',
    email: 'mariana.flores@correo.com',
    requestType: 'Individual',
    occupation: 'Analista de Sistemas',
    employmentRegime: 'Planilla 5ta Categoría (Continuidad 5 años)',
    status: 'nuevo',
    createdAt: '2026-09-19T10:48:00',
    originDistrict: 'Jesús María',
    originProject: 'Proyecto Park Prado',
    assignedAdvisor: 'Lic. Valeria Torres',
    financialCapacity: {
      netIncome: 7500,
      dtiRatio: 24,
      dtiMax: 40,
      dtiStatus: 'Saludable',
      incomeSupport: 'Sustentado con boletas',
      maxApprovablePayment: 2450,
      paymentHeadroom: 740,
      creditScoreLabel: '96% Normal SBS',
    },
    simulation: {
      certificateId: 'SIM-9812',
      propertyType: 'Departamento',
      district: 'Jesús María',
      propertyPrice: 385000,
      downPaymentAmount: 77000,
      downPaymentPct: 20,
      financingAmount: 308000,
      termYears: 20,
      monthlyPayment: 2410,
      tcea: 8.45,
      marketTcea: 9.1,
      bank: 'BCP',
      bbpApplied: true,
      bbpAmount: 18300,
      effectiveInitialPct: 22.4,
      effectiveInitialAmount: 86300,
    },
    matchedProperties: [
      {
        id: 'P-PP-502',
        name: 'Park Prado — Dpto. 502',
        address: 'Av. Brasil 1450, Jesús María',
        areaM2: 68,
        rooms: 3,
        baths: 2,
        price: 382000,
        match: 96,
        deliveryStatus: 'Entrega inmediata',
        appliesToMivivienda: true,
        recommended: true,
      },
    ],
    activity: [
      {
        id: 'A-1',
        date: '2026-09-19T10:48:00',
        title: 'Lead generado vía Simulador HipoSim Web',
        description: 'El cliente completó la simulación para Jesús María y solicitó que un asesor la contacte.',
        type: 'completed',
      },
      {
        id: 'A-2',
        date: '2026-09-19T10:49:00',
        title: 'Validación automática de Central SBS',
        description: 'Scoring positivo. Califica para tasa preferencial de BCP con Bono BBP Sostenible.',
        type: 'completed',
      },
      {
        id: 'A-3',
        date: '2026-09-19T10:56:00',
        title: 'Asignación de Lead a Sala de Ventas',
        description: 'Asignado por regla geográfica a la ejecutiva Valeria Torres (Sala Jesús María).',
        type: 'pending',
      },
    ],
  },
  {
    id: 'L-2024-089',
    name: 'Carlos Mendoza Paredes',
    dni: '46892310',
    dniValidatedSbs: true,
    age: 34,
    phone: '+51 987 654 321',
    email: 'carlos.mendoza.pe@gmail.com',
    requestType: 'Conyugal / Mancomunado',
    coApplicantName: 'Elena R. Vidal',
    occupation: 'Comercial — Panificadora',
    employmentRegime: 'Planilla 5ta Categoría (Continuidad 5 años)',
    status: 'nuevo',
    createdAt: '2026-09-19T10:42:00',
    originDistrict: 'Jesús María',
    originProject: 'Park Prado',
    assignedAdvisor: 'Valeria Soto',
    financialCapacity: {
      netIncome: 9700,
      dtiRatio: 34,
      dtiMax: 40,
      dtiStatus: 'Saludable',
      incomeSupport: 'Ingreso conyugal sustentado con boletas',
      maxApprovablePayment: 3280,
      paymentHeadroom: 1390,
      creditScoreLabel: '100% Normal SBS',
    },
    simulation: {
      certificateId: 'SIM-9821',
      propertyType: 'Departamento 3 Dormitorios',
      district: 'Jesús María',
      propertyPrice: 280000,
      downPaymentAmount: 42000,
      downPaymentPct: 15,
      financingAmount: 210800,
      termYears: 20,
      monthlyPayment: 1890,
      tcea: 9.25,
      marketTcea: 9.25,
      bank: 'BBVA',
      bbpApplied: true,
      bbpAmount: 27200,
      effectiveInitialPct: 24.7,
      effectiveInitialAmount: 69200,
    },
    matchedProperties: [
      {
        id: 'P-PP-502',
        name: 'Park Prado — Dpto. 502',
        address: 'Av. Brasil 1450, Jesús María (Sala VivaPerú)',
        areaM2: 68,
        rooms: 3,
        baths: 2,
        price: 282000,
        match: 98,
        deliveryStatus: 'Entrega inmediata',
        appliesToMivivienda: true,
        recommended: true,
      },
      {
        id: 'P-SF-804',
        name: 'Residencial San Felipe II — Dpto. 804 (2D+1)',
        address: 'Jr. San Felipe 804, Jesús María',
        areaM2: 61,
        rooms: 2,
        baths: 1,
        price: 269000,
        match: 94,
        deliveryStatus: 'Entrega en 8 meses',
        appliesToMivivienda: true,
        recommended: false,
      },
    ],
    activity: [
      {
        id: 'A-1',
        date: '2026-09-19T10:18:00',
        title: 'Lead generado vía Simulador HipoSim Web',
        description: 'El cliente completó la simulación para Jesús María y solicitó que un asesor de VivaPerú lo contacte.',
        type: 'completed',
      },
      {
        id: 'A-2',
        date: '2026-09-19T10:19:00',
        title: 'Validación automática de Central SBS',
        description: 'Scoring positivo. Califica para tasa preferencial de Banco BCP e Interbank con Bono BBP Sostenible.',
        type: 'completed',
      },
      {
        id: 'A-3',
        date: '2026-09-19T10:27:00',
        title: 'Asignación de Lead a Sala de Ventas',
        description: 'Asignado por regla geográfica a la ejecutiva Valeria Soto (Sala Jesús María).',
        type: 'pending',
      },
    ],
  },
  {
    id: 'L-2024-084',
    name: 'Roberto Chang Takahashi',
    dni: '09••••512',
    dniValidatedSbs: true,
    age: 44,
    phone: '+51 971 805 233',
    email: 'roberto.chang@correo.com',
    requestType: 'Individual',
    occupation: 'Docente universitario',
    employmentRegime: 'Planilla — Nombrado (10 años)',
    status: 'en_proceso',
    createdAt: '2026-09-19T09:02:00',
    originDistrict: 'Jesús María',
    originProject: 'Park Prado',
    assignedAdvisor: 'V. Torres',
    financialCapacity: {
      netIncome: 5800,
      dtiRatio: 18,
      dtiMax: 40,
      dtiStatus: 'Saludable',
      incomeSupport: 'Ingresos verificados — 1ra Vivienda',
      maxApprovablePayment: 2100,
      paymentHeadroom: 870,
      creditScoreLabel: '100% Normal SBS',
    },
    simulation: {
      certificateId: 'SIM-9788',
      propertyType: 'Departamento',
      district: 'Jesús María',
      propertyPrice: 310000,
      downPaymentAmount: 45000,
      downPaymentPct: 14.5,
      financingAmount: 265000,
      termYears: 20,
      monthlyPayment: 1890,
      tcea: 8.7,
      marketTcea: 9.4,
      bank: 'Interbank',
      bbpApplied: true,
      bbpAmount: 21400,
      effectiveInitialPct: 21.4,
      effectiveInitialAmount: 66400,
    },
    matchedProperties: [
      {
        id: 'P-SF-804',
        name: 'Residencial San Felipe II — Dpto. 804',
        address: 'Jr. San Felipe 804, Jesús María',
        areaM2: 61,
        rooms: 2,
        baths: 1,
        price: 305000,
        match: 89,
        deliveryStatus: 'Entrega en 8 meses',
        appliesToMivivienda: true,
        recommended: true,
      },
    ],
    activity: [
      {
        id: 'A-1',
        date: '2026-09-19T09:02:00',
        title: 'Lead generado vía Simulador HipoSim Web',
        description: 'Simulación completada para departamento en Jesús María.',
        type: 'completed',
      },
      {
        id: 'A-2',
        date: '2026-09-19T09:30:00',
        title: 'Contacto por WhatsApp',
        description: 'Primer contacto realizado por Lic. Valeria Torres.',
        type: 'completed',
      },
      {
        id: 'A-3',
        date: '2026-09-19T11:00:00',
        title: 'Visita a proyecto agendada',
        description: 'Visita programada para el 20/09 a las 4:00 PM.',
        type: 'pending',
      },
    ],
  },
  {
    id: 'L-2024-079',
    name: 'Lucía Alva Rospigliosi',
    dni: '72••••901',
    dniValidatedSbs: true,
    age: 31,
    phone: '+51 945 109 432',
    email: 'lucia.alva@correo.com',
    requestType: 'Individual',
    occupation: 'Enfermera',
    employmentRegime: 'Planilla — Sector salud (6 años)',
    status: 'cita',
    createdAt: '2026-09-19T07:15:00',
    originDistrict: 'Jesús María',
    originProject: 'San Felipe II',
    assignedAdvisor: 'V. Torres',
    financialCapacity: {
      netIncome: 4300,
      dtiRatio: 27,
      dtiMax: 40,
      dtiStatus: 'Saludable',
      incomeSupport: 'Ingresos verificados — Pre-aprobación adjunta',
      maxApprovablePayment: 1650,
      paymentHeadroom: 420,
      creditScoreLabel: '92% Normal SBS',
    },
    simulation: {
      certificateId: 'SIM-9754',
      propertyType: 'Departamento',
      district: 'Jesús María',
      propertyPrice: 420000,
      downPaymentAmount: 85000,
      downPaymentPct: 20.2,
      financingAmount: 335000,
      termYears: 20,
      monthlyPayment: 2750,
      tcea: 8.35,
      marketTcea: 9.0,
      bank: 'Scotiabank',
      bbpApplied: true,
      bbpAmount: 15300,
      effectiveInitialPct: 23.8,
      effectiveInitialAmount: 100300,
    },
    matchedProperties: [],
    activity: [
      {
        id: 'A-1',
        date: '2026-09-19T07:15:00',
        title: 'Lead generado vía Simulador HipoSim Web',
        description: 'Pre-aprobación adjunta enviada por el cliente.',
        type: 'completed',
      },
      {
        id: 'A-2',
        date: '2026-09-19T08:00:00',
        title: 'Cita agendada',
        description: 'Visita presencial confirmada para mañana 4:00 PM.',
        type: 'pending',
      },
    ],
  },
  {
    id: 'L-2024-071',
    name: 'Diego Paredes Gómez',
    dni: '41••••784',
    dniValidatedSbs: true,
    age: 37,
    phone: '+51 966 541 290',
    email: 'diego.paredes@correo.com',
    requestType: 'Individual',
    occupation: 'Ingeniero Civil',
    employmentRegime: 'Planilla — Empresa constructora (4 años)',
    status: 'cerrado',
    createdAt: '2026-09-18T16:40:00',
    originDistrict: 'Jesús María',
    originProject: 'Torre B',
    assignedAdvisor: 'V. Torres',
    financialCapacity: {
      netIncome: 7300,
      dtiRatio: 22,
      dtiMax: 40,
      dtiStatus: 'Saludable',
      incomeSupport: 'Ingresos verificados',
      maxApprovablePayment: 2600,
      paymentHeadroom: 390,
      creditScoreLabel: '100% Normal SBS',
    },
    simulation: {
      certificateId: 'SIM-9701',
      propertyType: 'Departamento',
      district: 'Jesús María',
      propertyPrice: 360000,
      downPaymentAmount: 72000,
      downPaymentPct: 20,
      financingAmount: 288000,
      termYears: 20,
      monthlyPayment: 2210,
      tcea: 8.2,
      marketTcea: 8.9,
      bank: 'BanBif',
      bbpApplied: true,
      bbpAmount: 18300,
      effectiveInitialPct: 20,
      effectiveInitialAmount: 72000,
    },
    matchedProperties: [],
    activity: [
      {
        id: 'A-1',
        date: '2026-09-15T08:12:00',
        title: 'Lead generado vía Simulador HipoSim Web',
        description: 'Simulación completada, Dpto. 504 Torre B.',
        type: 'completed',
      },
      {
        id: 'A-2',
        date: '2026-09-15T12:00:00',
        title: 'Contactado y derivado a asesoría presencial',
        description: 'Cliente atendido en sala de ventas.',
        type: 'completed',
      },
      {
        id: 'A-3',
        date: '2026-09-16T17:40:00',
        title: 'Cerrado: separación de departamento',
        description: 'Separación pagada: US$ 1,000.',
        type: 'completed',
      },
    ],
  },
  {
    id: 'L-2024-068',
    name: 'Gabriela Salazar Vega',
    dni: '46••••190',
    dniValidatedSbs: true,
    age: 28,
    phone: '+51 950 188 721',
    email: 'gabriela.salazar@correo.com',
    requestType: 'Individual',
    occupation: 'Contadora',
    employmentRegime: 'Independiente formal (2 años)',
    status: 'contactado',
    createdAt: '2026-09-18T14:10:00',
    originDistrict: 'Jesús María',
    originProject: 'Envío de proforma',
    assignedAdvisor: 'V. Torres',
    financialCapacity: {
      netIncome: 5100,
      dtiRatio: 31,
      dtiMax: 40,
      dtiStatus: 'Ajustado',
      incomeSupport: 'Perfil joven profesional',
      maxApprovablePayment: 1820,
      paymentHeadroom: 72,
      creditScoreLabel: '84% Normal SBS',
    },
    simulation: {
      certificateId: 'SIM-9660',
      propertyType: 'Departamento',
      district: 'Jesús María',
      propertyPrice: 295000,
      downPaymentAmount: 35000,
      downPaymentPct: 11.8,
      financingAmount: 260000,
      termYears: 20,
      monthlyPayment: 1740,
      tcea: 8.55,
      marketTcea: 9.2,
      bank: 'GNB',
      bbpApplied: true,
      bbpAmount: 25700,
      effectiveInitialPct: 20.6,
      effectiveInitialAmount: 60700,
    },
    matchedProperties: [],
    activity: [
      {
        id: 'A-1',
        date: '2026-09-18T14:10:00',
        title: 'Lead generado vía Simulador HipoSim Web',
        description: 'Envío de proforma solicitado por el cliente.',
        type: 'completed',
      },
    ],
  },
]

export function findLeadById(id: string) {
  return mockLeads.find((lead) => lead.id === id)
}

export interface FeedActivity extends LeadActivity {
  leadId: string
  leadName: string
}

export function getRecentActivity(limit = 6): FeedActivity[] {
  return mockLeads
    .flatMap((lead) =>
      lead.activity.map((entry) => ({ ...entry, leadId: lead.id, leadName: lead.name })),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

export function getWeeklyLeadCounts() {
  // Datos de demostración: distribución de leads generados en las últimas 4 semanas.
  return {
    labels: ['Sem. 1', 'Sem. 2', 'Sem. 3', 'Sem. 4 (actual)'],
    values: [4, 7, 5, mockLeads.length],
  }
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatRelativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `Hace ${hours} hora${hours === 1 ? '' : 's'}`
  const days = Math.round(hours / 24)
  return days === 1 ? 'Ayer' : `Hace ${days} días`
}
