import type { Metadata } from 'next'
import { headers } from 'next/headers'
import './globals.css'

export const metadata: Metadata = {
  title: 'kinesiapp',
  description: 'Gestión de consultorios de kinesiología',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Leer headers fuerza el render dinámico: la CSP lleva un nonce por request (src/proxy.ts)
  // y Next solo puede aplicarlo a sus scripts en un render dinámico.
  await headers()
  return (
    <html lang="es-AR">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  )
}
