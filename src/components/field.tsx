type FieldProps = {
  label: string
  name: string
  type?: string
  autoComplete?: string
  defaultValue?: string
  minLength?: number
  required?: boolean
}

export function Field({ label, name, type = 'text', ...rest }: FieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        className="rounded border border-[var(--color-line)] bg-transparent px-3 py-2"
        {...rest}
      />
    </label>
  )
}

export function SubmitButton({
  children,
  pending,
}: {
  children: React.ReactNode
  pending: boolean
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
    >
      {pending ? 'Un momento…' : children}
    </button>
  )
}
