import { headers } from 'next/headers'
import { resolveRequestId } from '@/shared/lib/request-id'

/** Request id que puso el proxy (o uno nuevo si la ruta no pasó por él). */
export async function getRequestId(): Promise<string> {
  return resolveRequestId((await headers()).get('x-request-id'))
}

/** Origen del request, para armar links de confirmación por email. */
export async function getRequestOrigin(): Promise<string> {
  const h = await headers()
  return h.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}
