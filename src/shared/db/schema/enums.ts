import { pgEnum } from 'drizzle-orm/pg-core'

// Espejo TIPADO de supabase/migrations. La fuente de verdad del schema son las migraciones;
// tests/integration/schema-drift.test.ts compara este archivo contra el catálogo real.
export const clinicStatus = pgEnum('clinic_status', ['active', 'suspended', 'canceled'])
export const clinicRole = pgEnum('clinic_role', ['owner', 'professional', 'reception'])
export const memberStatus = pgEnum('member_status', ['active', 'inactive'])
export const documentType = pgEnum('document_type', ['dni', 'pasaporte', 'otro'])
