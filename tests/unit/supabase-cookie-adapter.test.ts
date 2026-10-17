import { describe, expect, it, vi } from 'vitest'

vi.mock('next/headers', () => ({ cookies: vi.fn() }))
const { cookieAdapter } = await import('@/lib/supabase/server')

describe('cookieAdapter', () => {
  it('escribe el lote completo con sus opciones', () => {
    const set = vi.fn()
    cookieAdapter({ getAll: () => [], set }).setAll([
      { name: 'sb-x-auth-token.0', value: 'a', options: { httpOnly: true, maxAge: 43200 } },
      { name: 'sb-x-auth-token.1', value: '', options: { maxAge: 0 } },
    ])
    expect(set).toHaveBeenCalledTimes(2)
    expect(set).toHaveBeenNthCalledWith(1, {
      name: 'sb-x-auth-token.0',
      value: 'a',
      httpOnly: true,
      maxAge: 43200,
    })
  })

  it('si la primera escritura falla, no escribe ninguna y no tira (Server Component)', () => {
    const set = vi.fn(() => {
      throw new Error('Cookies can only be modified in a Server Action or Route Handler')
    })
    expect(() =>
      cookieAdapter({ getAll: () => [], set }).setAll([
        { name: 'a', value: '1' },
        { name: 'b', value: '2' },
      ]),
    ).not.toThrow()
    expect(set).toHaveBeenCalledTimes(1)
  })
})
