# Product

<!-- impeccable:product-schema 1 -->

> Estado al 2026-10-16: **0 entrevistas**. Todo lo que sigue es hipótesis de escritorio salvo que diga lo contrario. Se corrige con lo que entre en [`docs/gtm/aprendizajes.md`](docs/gtm/aprendizajes.md).

## Platform

web (escritorio de recepción y consultorio + teléfono del kinesiólogo). Sin app nativa en v1.

## Users

Un consultorio de kinesiología es el cliente (tenant). Adentro hay tres roles y un usuario indirecto.

- **Dueño/a del consultorio** (rol `owner`). Suele ser kinesiólogo/a que además atiende. Decide la compra, configura el consultorio, ve la plata y administra el equipo. HIPÓTESIS: tiene poco tiempo fuera de atender y hoy ordena todo con papel, WhatsApp y Excel.
- **Kinesiólogo/a del equipo** (rol `professional`). Atiende, evalúa y escribe evoluciones. Puede trabajar en más de un consultorio (por eso el consultorio activo va en la URL). HIPÓTESIS: con obra social atiende a varios pacientes por hora.
- **Recepción** (rol `reception`). Agenda, recibe pacientes, cobra, junta órdenes y tokens. **No ve contenido clínico.**
- **Paciente** (indirecto). No usa el sistema en v1. Sus datos son sensibles (Ley 25.326) y su historia clínica le pertenece (Ley 26.529, art. 14).

ICP-1 provisional: consultorio de 2-6 kinesiólogos con recepción, mezcla de obra social y particular, provincia de Buenos Aires. Ver [D2](docs/decisions/2026-10-16-arranque.md).

## Product Purpose

Que un consultorio de kinesiología argentino trabaje ordenado sin papel: saber quién viene, qué sesiones quedan de cada orden o paquete, qué se cobró y qué falta, y tener la historia clínica en regla. Cuál de esos dolores abre la puerta (la cuña) se elige con entrevistas entre cuatro candidatas: [D3](docs/decisions/2026-10-16-arranque.md).

## Positioning

HIPÓTESIS. Hecho para la kinesiología argentina (obras sociales, órdenes, sesiones autorizadas, atención simultánea), no un sistema médico genérico ni una agenda de turnos. El referente funcional es Pacientia (México) como catálogo de funciones mínimas, no como modelo validado ([teardown](docs/research/2026-10-16-pacientia.md)). La competencia real es papel + WhatsApp + Excel y una docena de productos locales ([mercado](docs/research/2026-10-16-mercado-y-regulacion.md)).

## Operating Context

- Mostrador de recepción con PC compartida: sesiones cortas (12 h), nada clínico a la vista de recepción.
- Box o gimnasio de rehabilitación: el kinesiólogo carga desde el teléfono entre paciente y paciente, con las manos ocupadas y poco tiempo.
- Fin de mes: se arma lo que se presenta al colegio o a los financiadores.
- Conectividad variable; nunca perder lo escrito.

## Capabilities and Constraints

### Lo que existe (2026-10-16)

Base técnica: registro e ingreso, crear consultorio, selector de consultorios, roles (dueño / profesional / recepción), aislamiento entre consultorios por RLS, auditoría append-only, CI. Detalle en [`docs/architecture.md`](docs/architecture.md).

### Lo que no existe todavía

Nada clínico ni de agenda: pacientes con UI, tratamientos, evoluciones, órdenes, cobros. Se construye después de elegir la cuña (regla de evidencia, [D7](docs/decisions/2026-10-16-arranque.md)).

### Restricciones duras

- Historia clínica: integridad, inalterabilidad, control de cambios, custodia ≥10 años, copia al paciente en 48 h (Ley 26.529). Sin borrado físico.
- No prescribir ni emitir órdenes, no teleconsulta (fuera de ReNaPDiS en v1).
- Nunca prometer "facturación a obras sociales": eso pasa por el colegio.
- Ver [backlog](docs/backlog.md) para lo que no se hace.

## Brand Commitments

Nombre de trabajo: kinesiapp ([D11](docs/decisions/2026-10-16-arranque.md)). Sin identidad visual hasta el gate del 27/11. Tono: rioplatense, claro, profesional, sin jerga técnica ni promesas que el producto no cumple.

## Evidence on Hand

Solo investigación de escritorio al 2026-10-16:

- [Teardown de Pacientia](docs/research/2026-10-16-pacientia.md).
- [Mercado y regulación](docs/research/2026-10-16-mercado-y-regulacion.md).
- Aprendizajes de TurnoGol (otro producto del founder): el cuello de botella fue vender, no construir; mostrar el estado de la plata, no el del sistema.

Entrevistas: 0. Pilotos: 0.

## Product Principles

1. **Datos de salud primero.** Privacidad por defecto: recepción no ve lo clínico, se registra quién lee cada historia, nada clínico en logs ni en herramientas de terceros.
2. **Mostrar el estado de la plata y de las órdenes, no el del sistema.** "Quedan 3 sesiones de esta orden, vence el viernes", no "Confirmado".
3. **Densidad legible.** Pantallas de trabajo, no tarjetas decorativas.
4. **Velocidad y teclado.** Lo frecuente en pocos toques o teclas.
5. **Prevención de errores.** Nunca perder lo escrito; nada se borra, se corrige con rastro.
6. **Sin configurabilidad "por las dudas".**

## Accessibility & Inclusion

Objetivo WCAG 2.2 AA, verificado automática y manualmente. Foco visible, navegación completa por teclado, contraste suficiente, formularios con errores claros. Documento del paciente flexible (tipo + número): no excluir extranjeros.
