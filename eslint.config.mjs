import tseslint from 'typescript-eslint'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

/**
 * Flat config. Base de TurnoGol (next/core-web-vitals + typescript-eslint con tipos) más las
 * reglas propias que protegen el modelo de seguridad. Cada prohibición dice por qué.
 */
const noRestrictedImportsBase = {
  patterns: [
    {
      group: ['../*', './../*'],
      message: 'Usá el alias @/ : las reglas de capas comparan rutas absolutas.',
    },
  ],
}

export default tseslint.config(
  { ignores: ['.next/**', 'node_modules/**', '.tmp/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: { project: './tsconfig.json', tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/\\bcancell?ed\\b/][value=/cancelled/]",
          message: "ENUMs y columnas usan 'canceled' (una L).",
        },
        {
          selector: "MemberExpression[property.name='getSession']",
          message: 'getSession() no valida el token en el servidor: usá getAuthUser() (getUser).',
        },
        {
          selector: "TemplateElement[value.raw=/set_config|SET LOCAL|SET ROLE/i]",
          message: 'El contexto de DB se fija solo en src/shared/db/client.ts (withClinicContext).',
        },
      ],
    },
  },
  // Solo src/shared/db habla con el driver de Postgres.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/shared/db/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          ...noRestrictedImportsBase,
          paths: [
            { name: 'postgres', message: 'Usá withClinicContext de @/shared/db/client.' },
            { name: 'drizzle-orm/postgres-js', message: 'Usá withClinicContext de @/shared/db/client.' },
          ],
        },
      ],
    },
  },
  // Capas: shared no conoce dominio ni app; modules no conoce app ni server.
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          ...noRestrictedImportsBase,
          patterns: [
            ...noRestrictedImportsBase.patterns,
            { group: ['@/modules/*', '@/app/*', '@/server/*', '@/lib/*'], message: 'shared es la capa base.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/modules/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          ...noRestrictedImportsBase,
          paths: [{ name: 'postgres', message: 'Usá withClinicContext de @/shared/db/client.' }],
          patterns: [
            ...noRestrictedImportsBase.patterns,
            { group: ['@/app/*', '@/server/*'], message: 'El dominio no depende de la capa web.' },
          ],
        },
      ],
    },
  },
  // El contexto de DB se fija en el cliente; los tests lo hacen a propósito para atacarlo.
  {
    files: ['src/shared/db/client.ts', 'tests/**/*.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['scripts/**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },
)
