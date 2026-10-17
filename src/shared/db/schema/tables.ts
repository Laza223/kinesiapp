import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { clinicRole, clinicStatus, documentType, memberStatus } from './enums'

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}

export const clinics = pgTable('clinics', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  status: clinicStatus('status').notNull().default('active'),
  createdBy: uuid('created_by').notNull(),
  ...timestamps,
})

export const clinicMembers = pgTable('clinic_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id').notNull(),
  userId: uuid('user_id').notNull(),
  role: clinicRole('role').notNull(),
  status: memberStatus('status').notNull().default('active'),
  ...timestamps,
})

export const auditEvents = pgTable('audit_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id').notNull(),
  actorUserId: uuid('actor_user_id').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id'),
  requestId: text('request_id'),
  metadata: jsonb('metadata').notNull().default({}),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
})

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id').notNull(),
  fullName: text('full_name').notNull(),
  documentType: documentType('document_type'),
  documentNumber: text('document_number'),
  createdByMemberId: uuid('created_by_member_id').notNull(),
  ...timestamps,
})
