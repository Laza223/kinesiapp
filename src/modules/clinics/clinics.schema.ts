import { z } from 'zod'

// Mismo rango que el CHECK de clinics.name (migración 0002).
export const clinicNameSchema = z
  .string()
  .trim()
  .min(2, 'El nombre tiene que tener al menos 2 caracteres.')
  .max(120, 'El nombre puede tener hasta 120 caracteres.')
