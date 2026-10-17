import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

type SetAll = (
  cookies: { name: string; value: string; options?: Record<string, unknown> }[],
  headers: Record<string, string>,
) => void

const getClaims = vi.fn()
let capturedSetAll: SetAll | null = null

vi.mock('@supabase/ssr', () => ({
  createServerClient: (_url: string, _key: string, opts: { cookies: { setAll: SetAll } }) => {
    capturedSetAll = opts.cookies.setAll
    return { auth: { getClaims } }
  },
}))

const { proxy, config } = await import('@/proxy')

function request(path = '/c/x/inicio', headers: Record<string, string> = {}) {
  return new NextRequest(new URL(path, 'http://localhost:3000'), { headers })
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'placeholder-placeholder-placeholder')
  getClaims.mockReset()
  capturedSetAll = null
})

describe('proxy', () => {
  it('pone CSP con nonce y strict-dynamic, sin unsafe-inline en scripts', async () => {
    getClaims.mockResolvedValue({ data: null, error: null })
    const res = await proxy(request())
    const csp = res.headers.get('content-security-policy') ?? ''
    expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/)
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/)
    expect(csp).toContain("frame-ancestors 'none'")
  })

  it('cada request lleva un nonce distinto', async () => {
    getClaims.mockResolvedValue({ data: null, error: null })
    const a = (await proxy(request())).headers.get('content-security-policy')
    const b = (await proxy(request())).headers.get('content-security-policy')
    expect(a).not.toBe(b)
  })

  it('devuelve el request id entrante si es válido y genera uno si no', async () => {
    getClaims.mockResolvedValue({ data: null, error: null })
    expect(
      (await proxy(request('/', { 'x-request-id': 'abc-123' }))).headers.get('x-request-id'),
    ).toBe('abc-123')
    const generated = (await proxy(request('/', { 'x-request-id': 'no válido!' }))).headers.get(
      'x-request-id',
    )
    expect(generated).toMatch(/^[A-Za-z0-9]{12}$/)
  })

  it('las cookies renovadas llegan a la respuesta y los headers de caché también', async () => {
    getClaims.mockImplementation(async () => {
      capturedSetAll!(
        [
          { name: 'sb-x-auth-token', value: 'nuevo', options: { maxAge: 43200 } },
          { name: 'sb-x-auth-token.1', value: '', options: { maxAge: 0 } },
        ],
        { 'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0' },
      )
      return { data: null, error: null }
    })
    const res = await proxy(request('/', { cookie: 'sb-x-auth-token.1=viejo' }))
    expect(res.cookies.get('sb-x-auth-token')?.value).toBe('nuevo')
    expect(res.headers.get('cache-control')).toContain('no-store')
  })

  it('falla abierto si GoTrue no responde', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    getClaims.mockRejectedValue(new Error('fetch failed'))
    const res = await proxy(request())
    expect(res.status).toBe(200)
  })

  it('el interruptor de emergencia apaga el refresco', async () => {
    vi.stubEnv('SESSION_REFRESH_DISABLED', '1')
    await proxy(request())
    expect(getClaims).not.toHaveBeenCalled()
  })

  it('el matcher excluye estáticos', () => {
    const source = (config.matcher[0] as { source: string }).source
    const re = new RegExp(`^${source}$`)
    expect(re.test('/_next/static/chunk.js')).toBe(false)
    expect(re.test('/favicon.ico')).toBe(false)
    expect(re.test('/c/abc/inicio')).toBe(true)
  })
})
