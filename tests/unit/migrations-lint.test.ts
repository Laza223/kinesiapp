import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const DIR = 'supabase/migrations'
const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.sql'))
  .sort()

describe('lint de migraciones', () => {
  it('hay migraciones y los nombres siguen AAAAMMDDNNNNNN_snake_case.sql', () => {
    expect(files.length).toBeGreaterThan(0)
    for (const f of files) expect(f).toMatch(/^\d{14}_[a-z0-9_]+\.sql$/)
  })

  it.for(files)('%s: toda tabla creada habilita y fuerza RLS en el mismo archivo', (file) => {
    const sql = readFileSync(join(DIR, file), 'utf8')
    const tables = [...sql.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?public\.(\w+)/gi)].map(
      (m) => m[1]!,
    )
    for (const t of tables) {
      expect(sql, `${t} sin ENABLE RLS`).toMatch(
        new RegExp(`ALTER TABLE public\\.${t} ENABLE ROW LEVEL SECURITY`),
      )
      expect(sql, `${t} sin FORCE RLS`).toMatch(
        new RegExp(`ALTER TABLE public\\.${t} FORCE ROW LEVEL SECURITY`),
      )
    }
  })

  it.for(files)("%s: sin 'cancelled', sin grants a PUBLIC, sin USING (true)", (file) => {
    const sql = readFileSync(join(DIR, file), 'utf8')
    expect(sql).not.toMatch(/cancelled/i)
    expect(sql).not.toMatch(/GRANT[^;]+TO\s+PUBLIC/i)
    expect(sql).not.toMatch(/USING\s*\(\s*true\s*\)/i)
  })
})
