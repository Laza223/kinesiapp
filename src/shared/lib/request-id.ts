// Id no criptográfico para correlacionar logs. Sin built-ins de Node.
function newRequestId(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < 12; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return out
}

/** El id entrante si es razonable (1-64 caracteres seguros); si no, uno nuevo. */
export function resolveRequestId(incoming: string | null | undefined): string {
  return incoming && /^[A-Za-z0-9_-]{1,64}$/.test(incoming) ? incoming : newRequestId()
}
