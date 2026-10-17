# Backlog

> Reemplaza la "matriz de paridad" del plan original ([D1](decisions/2026-10-16-arranque.md)). Cada ítem dice qué evidencia hace falta para construirlo. Regla: nada clínico entra al código sin FACT o SIGNAL en [`docs/gtm/aprendizajes.md`](gtm/aprendizajes.md) ([D7](decisions/2026-10-16-arranque.md)).

## Base técnica

**Hecho (2026-10-16):** registro e ingreso, crear consultorio, selector de consultorios, roles dueño/profesional/recepción, aislamiento entre consultorios por RLS con tests como rol real, auditoría append-only, CI. Detalle: [`architecture.md`](architecture.md).

**Semana 1 (bajo arrepentimiento, no clínico):**
- Invitaciones de equipo **sin service-role**: token de un uso + link para mandar por WhatsApp; la aceptación pasa por una función de la base que verifica el email.
- MFA TOTP para el dueño.

## Funciones mínimas (sin esto te descartan)

| Función | Evidencia necesaria para construir |
|---|---|
| Pacientes con ficha y documento flexible | Ninguna extra (toda cuña la necesita); campos finales según entrevistas |
| Agenda multi-profesional día/semana, usable en el teléfono | Cuña elegida (define si es por tratamiento y con cupo simultáneo, D4) |
| Evaluación inicial y evolución por sesión, con versiones y sin borrado | Cuña elegida + revisión legal de firma (D10) |
| Archivos privados (estudios, foto de la orden) | Revisión legal de región |
| Cobros y caja simple | Cuña elegida |
| Recepción sin acceso clínico | Ninguna extra (ya es regla del modelo) |
| Exportar la historia del paciente en PDF (copia en 48 h) | Revisión legal (formato) |
| Recordatorio manual por link `wa.me` | ≥2 entrevistas con ausencias como dolor |

## Cuñas candidatas ([D3](decisions/2026-10-16-arranque.md))

| Cuña | Qué se construiría | Qué la desbloquea |
|---|---|---|
| **A. Órdenes y autorizaciones** | Orden con N sesiones, vencimiento y topes (PMO, PAMI); token/copago por sesión; matrícula del prescriptor; número OME/CUIR; imagen de la orden; alertas de vencimiento y de sesiones restantes; conciliación de pagos y débitos; reglas por financiador editables sin deploy | ≥3 de 5 entrevistas no inducidas con dolor A |
| **B. Particulares** | Paquetes de sesiones, saldo por paciente, cobro (registro, links de pago después), caja, Factura C más adelante | ≥3 de 5 con dolor B |
| **C. Documentar rápido** | Plantillas de evaluación kinésica (EVA, goniometría, Daniels), mapa corporal SVG propio, evolución en pocos toques; IA recién después de revisión legal | ≥3 de 5 con dolor C |
| **D. Agenda por tratamiento** | Series de N sesiones, cupo simultáneo por profesional, ausencias, recordatorios | ≥3 de 5 con dolor D |

## Después (si la piden, con evidencia)

Reserva online pública · Google Calendar · IA documental (borrador revisable) · recordatorios automáticos por WhatsApp (por serie o semana, con tope o adicional) · facturación ARCA (Factura C) · paquetes avanzados · informes para financiadores y derivaciones · ejercicios domiciliarios · multi-sede · invitaciones por email · plan "archivo" de solo lectura para la custodia de 10 años.

## No se hace

- Paridad con Pacientia como meta.
- REA o cualquier ingeniería inversa sobre productos de terceros (D5).
- Multi-especialidad.
- Prescribir o emitir órdenes; teleconsulta (fuera de ReNaPDiS).
- Marketplace de pacientes.
- App nativa.
- Procesar pagos de pacientes en v1 (solo registrarlos).
- Prometer "facturación a obras sociales": la presentación pasa por el colegio.
