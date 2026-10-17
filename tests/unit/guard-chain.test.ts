import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Candado estático: los layouts NO corren para las Server Actions, así que cada acción tiene
 * que llamar a su propio guard, y cada página de /c/[clinicId] a requireRole.
 */
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const files = walk('src/app')
// Acciones públicas a propósito (no hay sesión todavía): login y alta.
const PUBLIC_ACTIONS = new Set(['loginAction', 'signupAction'])
const GUARD_CALL = /\b(authorizeAction|authorizeUserAction)\(/

describe('cadena de guards', () => {
  const actionFiles = files.filter((f) => f.endsWith('actions.ts'))

  it('hay acciones para revisar', () => {
    expect(actionFiles.length).toBeGreaterThan(0)
  })

  it.for(actionFiles)('%s: cada acción exportada llama a un guard', (file) => {
    const source = readFileSync(file, 'utf8')
    expect(source.startsWith("'use server'")).toBe(true)
    const actions = [...source.matchAll(/export async function (\w+)\s*\(/g)].map((m) => m[1]!)
    for (const name of actions) {
      if (PUBLIC_ACTIONS.has(name)) continue
      const body = source.slice(source.indexOf(`function ${name}`))
      const nextExport = body.indexOf('export ', 1)
      const own = nextExport === -1 ? body : body.slice(0, nextExport)
      expect(own, `${name} no llama a un guard`).toMatch(GUARD_CALL)
    }
  })

  it('toda página bajo /c/[clinicId] llama a requireRole', () => {
    const pages = files.filter(
      (f) => f.includes(join('c', '[clinicId]')) && /(page|layout)\.tsx$/.test(f),
    )
    expect(pages.length).toBeGreaterThan(0)
    for (const page of pages) expect(readFileSync(page, 'utf8'), page).toMatch(/requireRole\(/)
  })
})
