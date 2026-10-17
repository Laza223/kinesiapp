# kinesiapp

SaaS para consultorios de kinesiología en Argentina. Etapa actual: **validación con kinesiólogos** (6 semanas, hasta el 27/11/2026) sobre una base técnica multi-tenant ya lista.

- Qué se decidió y por qué: [`docs/decisions/2026-10-16-arranque.md`](docs/decisions/2026-10-16-arranque.md)
- Producto (hipótesis): [`PRODUCT.md`](PRODUCT.md) · backlog: [`docs/backlog.md`](docs/backlog.md)
- Validación: [`docs/gtm/README.md`](docs/gtm/README.md) · guion de entrevista: [`docs/gtm/entrevista.md`](docs/gtm/entrevista.md)
- Investigación: [Pacientia](docs/research/2026-10-16-pacientia.md) · [mercado y regulación](docs/research/2026-10-16-mercado-y-regulacion.md)
- Legal: [`docs/legal/preguntas-abogado-y-contador.md`](docs/legal/preguntas-abogado-y-contador.md)
- Técnica: [`docs/architecture.md`](docs/architecture.md) · despliegue: [`docs/deploy.md`](docs/deploy.md) · guía para Claude: [`CLAUDE.md`](CLAUDE.md)

## Levantarlo en local

Requisitos: Node 22, pnpm 10, PostgreSQL 16 (binarios; no hace falta Docker).

```bash
pnpm install
pnpm db:local:up          # Postgres efímero en 127.0.0.1:54322
pnpm test                 # unitarios
pnpm test:integration     # integración + aislamiento entre consultorios
pnpm build
```

Para usar la app con login real hace falta Supabase Auth: un proyecto de Supabase o `supabase start` (requiere Docker). Copiar `.env.example` a `.env.local` y completar. Pasos completos en [`docs/deploy.md`](docs/deploy.md).
