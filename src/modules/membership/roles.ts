export const CLINIC_ROLES = ['owner', 'professional', 'reception'] as const
export type ClinicRole = (typeof CLINIC_ROLES)[number]

export const ROLE_LABELS: Record<ClinicRole, string> = {
  owner: 'Dueño/a',
  professional: 'Kinesiólogo/a',
  reception: 'Recepción',
}
