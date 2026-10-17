import { adminSql, newId } from './db'

type Role = 'owner' | 'professional' | 'reception'

export type SeededClinic = {
  clinicId: string
  users: Record<Role, string>
  members: Record<Role, string>
  patientId: string
}

/** Siembra un consultorio completo (dueño, profesional, recepción, un paciente y un evento). */
export async function seedClinic(name: string): Promise<SeededClinic> {
  const sql = adminSql()
  const users: Record<Role, string> = { owner: newId(), professional: newId(), reception: newId() }
  const [clinic] = await sql<{ id: string }[]>`
    INSERT INTO clinics (name, created_by) VALUES (${name}, ${users.owner}) RETURNING id`
  const clinicId = clinic!.id
  const members = {} as Record<Role, string>
  for (const role of Object.keys(users) as Role[]) {
    const [m] = await sql<{ id: string }[]>`
      INSERT INTO clinic_members (clinic_id, user_id, role)
      VALUES (${clinicId}, ${users[role]}, ${role}) RETURNING id`
    members[role] = m!.id
  }
  const [patient] = await sql<{ id: string }[]>`
    INSERT INTO patients (clinic_id, full_name, document_type, document_number, created_by_member_id)
    VALUES (${clinicId}, ${'Paciente de ' + name}, 'dni', ${String(Math.floor(Math.random() * 1e8))}, ${members.professional})
    RETURNING id`
  await sql`
    INSERT INTO audit_events (clinic_id, actor_user_id, action, entity_type, entity_id)
    VALUES (${clinicId}, ${users.owner}, 'clinic.created', 'clinic', ${clinicId})`
  return { clinicId, users, members, patientId: patient!.id }
}
