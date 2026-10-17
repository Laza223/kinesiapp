---
paths:
  - "src/server/**"
  - "src/modules/membership/**"
  - "src/app/**/actions.ts"
---

# Roles y guards

- Roles del consultorio: `owner` (dueño/a: todo), `professional` (kinesiólogo/a: lo clínico), `reception` (recepción: agenda, pacientes, cobros; **nunca contenido clínico**). Fuente: `clinic_members.role`.
- El rol se lee de la base en cada request (`getActiveMembership` bajo RLS). Nunca del JWT, de una cookie ni de la URL.
- El consultorio activo va en la URL (`/c/[clinicId]/…`) y es solo una pista: el guard lo re-verifica.
- Páginas: `requireRole(clinicId, roles)`. Server Actions: `authorizeAction(clinicId, roles)` o `authorizeUserAction()`. Cada acción llama al suyo (los layouts no corren para las acciones); `tests/unit/guard-chain.test.ts` lo exige. Acciones públicas: solo login y alta, en la allowlist del test.
- El clinicId de una acción se pasa explícito (`action.bind(null, clinicId)`), nunca se deduce.
- Los guards de la UI son conveniencia: la autorización real es RLS. Ningún control puramente visual reemplaza a una política.
