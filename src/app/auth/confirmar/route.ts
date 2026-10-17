import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sanitizeNext } from '@/lib/safe-redirect'

const ALLOWED_TYPES = new Set<EmailOtpType>(['signup', 'email', 'recovery', 'invite'])
const tokenHashSchema = z.string().min(1).max(512)

/** Link de confirmación por email (token_hash). Al terminar manda a `/`, que rutea. */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const tokenHash = tokenHashSchema.safeParse(params.get('token_hash'))
  const type = params.get('type') as EmailOtpType | null
  const failure = new URL('/ingresar?error=link', req.url)
  if (!tokenHash.success || !type || !ALLOWED_TYPES.has(type)) return NextResponse.redirect(failure)

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash.data })
  if (error) return NextResponse.redirect(failure)
  return NextResponse.redirect(new URL(sanitizeNext(params.get('next'), '/'), req.url))
}
