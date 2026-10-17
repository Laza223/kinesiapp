import { redirect } from 'next/navigation'
import { getAuthUser } from '@/modules/auth/session'
import { homePathFor } from '@/modules/membership/access'
import { listMyMemberships } from '@/modules/membership/membership.service'

/** Router: sin sesión → /ingresar; con sesión → según cuántos consultorios tenga. */
export default async function Home() {
  const user = await getAuthUser()
  if (!user) redirect('/ingresar')
  redirect(homePathFor(await listMyMemberships(user.userId)))
}
