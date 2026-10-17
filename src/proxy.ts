import type { NextRequest } from 'next/server'
import { refreshSessionCookies } from '@/lib/supabase/proxy'
import { buildCsp } from '@/lib/security-headers'
import { resolveRequestId } from '@/shared/lib/request-id'

/**
 * Proxy de Next 16 (ex `middleware.ts`; corre en runtime Node). Tres cosas, en este orden:
 *   1. request id para correlacionar logs;
 *   2. nonce + Content-Security-Policy (Next aplica el nonce a sus scripts leyendo el header);
 *   3. refresco de la sesión de Supabase.
 * No autoriza: los guards de cada página y de cada Server Action son la única puerta.
 */
export async function proxy(req: NextRequest) {
  const requestId = resolveRequestId(req.headers.get('x-request-id'))
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce, process.env.NODE_ENV === 'development')

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-request-id', requestId)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const res = await refreshSessionCookies(req, requestHeaders)
  res.headers.set('Content-Security-Policy', csp)
  res.headers.set('x-request-id', requestId)
  return res
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
