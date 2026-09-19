import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

/**
 * Preset de PrimeVue basado en los tokens de marca del Capítulo IV
 * (Style Guidelines). PrimeVue v4 descontinuó el theme "Material" clásico
 * en favor de este sistema de theming por tokens; Aura es el preset base
 * más cercano en geometría (bordes redondeados, elevación sutil) y se
 * sobreescribe con la paleta de HipoSim.
 */
export const HipoSimPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e6f0f1',
      100: '#c0dadc',
      200: '#96c2c6',
      300: '#6baaaf',
      400: '#4c979d',
      500: '#0e5c63', // verde azulado — color principal de marca
      600: '#0c5359',
      700: '#0a464b',
      800: '#083a3e',
      900: '#052427',
      950: '#031718',
    },
  },
})
