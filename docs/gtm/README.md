# Validación de kinesiapp: sistema operativo de 6 semanas

> **Fuente de verdad operativa de la validación.** La sección ESTADO se actualiza después de cada charla; el resto es referencia. Decisiones que lo rigen: [`docs/decisions/2026-10-16-arranque.md`](../decisions/2026-10-16-arranque.md) (D2, D3, D6, D7, D8). Guion: [`entrevista.md`](entrevista.md). Registro: [`aprendizajes.md`](aprendizajes.md).

## ESTADO (actualizar acá, solo acá)

| | |
|---|---|
| **Fecha** | 2026-10-16 |
| **Fase** | Semana 0 · base técnica + materiales listos |
| **Hoy toca** | Mandar los primeros pedidos de presentación ([`entrevista.md`](entrevista.md) §A) |
| **Bloqueado por** | — |

| Métrica | Hoy | Umbral | Fuente |
|---|---|---|---|
| Pedidos de presentación enviados | 0 | ≥10 (semana 1) | CRM |
| Entrevistas no inducidas registradas | 0 | ≥5 (semana 2) · 8-10 (semana 3) | `data/entrevistas/` |
| Cuña elegida | — | ≥3 de 5 en la misma (semana 3) | este archivo |
| Ofertas escritas de piloto entregadas | 0 | ≥2 (semana 5) | CRM |
| Pilotos aceptados con precio escrito | 0 | ≥2 (gate 27/11) | CRM |
| Referidos ("me lo pasó X") | 0 | ≥1 | CRM |

## Calendario

| Semana | Founder (4-6 h) | Claude | Gate |
|---|---|---|---|
| 0 · 16/10 | Aprobar el plan | Docs + base técnica | CI verde y aislamiento probado |
| 1 · 19-25/10 | ≥10 pedidos de presentación · 2-3 entrevistas · presupuesto de abogado y contador · INPI y dominios | Invitaciones sin service-role · MFA del dueño | ≥10 pedidos enviados |
| 2 · 26/10-1/11 | Llegar a ≥5 entrevistas no inducidas | Nada clínico; staging solo si hay cuentas | ≥5 registradas |
| 3 · 2-8/11 | TurnoGol cierra su experimento: revisar horas · elegir cuña | Prototipo navegable con datos sintéticos de la cuña | ≥3 de 5 en la misma cuña |
| 4-5 · 9-22/11 | Segunda vuelta con prototipo y oferta escrita (precio día 0) | Recorrido persistente de la cuña + requisitos legales mínimos | ≥2 ofertas entregadas |
| 6 · 23-27/11 | Cierre | — | ≥2 aceptan → seguir · 1 → +2 semanas · 0 → pausar |

## Gates (cada rojo tiene su acción escrita antes)

| Cuándo | Métrica | Verde | Rojo → acción |
|---|---|---|---|
| Semana 1 | Pedidos de presentación | ≥10 | Problema de horas, no de mensaje: bloquear 2 franjas fijas en el calendario |
| Semana 2 | Entrevistas no inducidas | ≥5 | Extender 1 semana; pedir referidos a cada entrevistado; **no programar** |
| Semana 3 | Cuña | ≥3 de 5 nombran primero la misma | Disperso → 5 entrevistas más antes de decidir; algo fuera de A-D → abrir E |
| Semana 5 | Ofertas escritas | ≥2 | Revisar objeción principal; si es precio puro ×3, revisar D8 |
| 27/11 | Pilotos aceptados con precio escrito | ≥2 | 1 → +2 semanas · 0 → pausar kinesiapp y registrar por qué |

Reglas transversales:
- **No se compensa un rojo con código.** Si las charlas no llegan, se ponen más horas de charla, no funciones.
- Un rojo cambia una decisión solo cuando se cumple su trigger escrito en el decision doc.
- Nada clínico entra al código sin FACT o SIGNAL en [`aprendizajes.md`](aprendizajes.md) (D7).

## Cómo se elige la cuña

Cada entrevista codifica `dolor_principal` = lo primero que el kine nombra sin inducir:

- **A** órdenes, autorizaciones, planillas, tokens, débitos, presentación al colegio
- **B** cobro a particulares, paquetes, caja, facturas
- **C** historia clínica, evoluciones, papeleo de la sesión
- **D** agenda, turnos, ausencias, series, recordatorios, atención simultánea
- **E** otra cosa concreta (anotar textual)
- **X** nada concreto / "está todo bien"

Decisión en la semana 3: si ≥3 de 5 entrevistas válidas tienen el mismo `dolor_principal`, esa es la cuña. Si no, 5 más. Entrevistas inducidas, durante demo o con amigos/familia se registran pero **no cuentan** ([`entrevista.md`](entrevista.md) §H).

## Puntaje de ICP (0 = no · 1 = más o menos · 2 = sí)

| Criterio | 0 | 1 | 2 |
|---|---|---|---|
| **Profesionales** | 1 | 7+ | **2-6** |
| **Recepción** | no hay | a veces / familiar | sí, con horario |
| **Mezcla obra social** | solo particular o solo una OS | mixta con poca OS | mixta con varias OS |
| **Herramientas actuales** | software dedicado y contento | Excel / Google Calendar | papel, cuaderno, WhatsApp |
| **Señal de desorden** | nada | "a veces se pierde algo" | "me rebotan órdenes", "pierdo planillas", "no sé quién me debe" |
| **Acceso** | frío | presentación indirecta | presentación directa o referido de un entrevistado |
| **Decisor en la charla** | no | socio que decide con otro | dueño/a presente |

**Total /14.** Priorizar ≥10 para la segunda vuelta (oferta). 7-9 segunda ola. <7 solo si es referido.

## CRM: campos

Google Sheet, una fila por consultorio. Export a `docs/gtm/data/crm.csv`. **`docs/gtm/data/` está en `.gitignore`: nombres, teléfonos y notas crudas nunca entran a git.** En git se cita solo el id (`D01`…).

| Campo | Tipo / enum |
|---|---|
| `id` | `D01`… `Dnn` |
| `fecha` | AAAA-MM-DD |
| `fuente` | `presentacion:<intermediario>` · `referido:<Dnn>` · `frio` |
| `profesionales` | entero |
| `recepcion` | `si` / `no` / `a-veces` |
| `pct_os` | entero aproximado (declarado) |
| `financiadores_principales` | texto corto (p. ej. `IOMA, PAMI, OSDE`) |
| `herramientas_actuales` | `papel` · `whatsapp` · `excel` · `sistema:<cual>` |
| `dolor_principal` | `A` · `B` · `C` · `D` · `E` · `X` |
| `dolor_secundario` | ídem |
| `atencion_simultanea` | `si:<n por hora>` / `no` / `?` |
| `inducida` | `si` / `no` |
| `score` | 0-14 |
| `etapa` | `pedido` · `contactado` · `entrevistado` · `segunda-vuelta` · `oferta` · `piloto-aceptado` · `salida` |
| `proxima_accion`, `fecha_proxima` | obligatorios en toda fila |
| `motivo_salida` | `precio` · `tiempo` · `ya-tiene-sistema` · `no-necesita` · `confianza` · `otra:<txt>` |

Notas crudas por entrevista: `docs/gtm/data/entrevistas/AAAA-MM-DD-Dnn.md` (fuera de git).
