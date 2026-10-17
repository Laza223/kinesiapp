import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { MIN_PASSWORD_LENGTH } from '@/modules/auth/auth.schema'
import { readServerEnv } from '@/shared/env'
import { resolveRequestId } from '@/shared/lib/request-id'
import { dbSslOptions } from '@/shared/db/ssl'

describe('configuración', () => {
  it('MIN_PASSWORD_LENGTH coincide con supabase/config.toml', () => {
    const toml = readFileSync('supabase/config.toml', 'utf8')
    expect(toml).toMatch(new RegExp(`minimum_password_length = ${MIN_PASSWORD_LENGTH}\\b`))
  })

  it('readServerEnv trata "" como ausente y explica qué falta', () => {
    expect(() =>
      readServerEnv({
        DATABASE_URL: '',
        NEXT_PUBLIC_SUPABASE_URL: 'http://x',
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'k'.repeat(30),
      }),
    ).toThrow(/DATABASE_URL/)
  })

  it('TLS: sin TLS en localhost, CA de Supabase y validación en remoto', () => {
    expect(dbSslOptions('postgres://u:p@127.0.0.1:54322/db')).toBe(false)
    expect(
      dbSslOptions('postgres://u:p@aws-1-sa-east-1.pooler.supabase.com:6543/postgres'),
    ).toMatchObject({
      rejectUnauthorized: true,
    })
  })

  it('request id: rechaza valores raros', () => {
    expect(resolveRequestId('a'.repeat(65))).toHaveLength(12)
    expect(resolveRequestId('<script>')).toHaveLength(12)
  })
})
