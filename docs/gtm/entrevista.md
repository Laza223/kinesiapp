# Presentaciones y entrevista de discovery (Dnn)

> 20-30 minutos, presencial, videollamada o llamada. Objetivo: saber qué le duele al kine **sin decirle qué le duele**. No es una demo. Notas crudas en `docs/gtm/data/entrevistas/AAAA-MM-DD-Dnn.md` (fuera de git). Al terminar: fila en el CRM ([`README.md`](README.md)) y, si aportó algo, una línea en [`aprendizajes.md`](aprendizajes.md).

## A. Pedir presentaciones (el acceso es indirecto)

**Mensaje al intermediario** (WhatsApp, personalizado):

> Hola [nombre], ¿cómo andás? Te hago una consulta: estoy armando un sistema para consultorios de kinesiología y antes de programar nada quiero hablar con kinesiólogos para entender cómo trabajan. ¿Conocés a alguien que me pueda dar 20 minutos? No le vendo nada, es solo para aprender. Si te sirve, te paso un texto para que se lo reenvíes.

**Texto reenviable al kine:**

> Te presento a [tu nombre]: está armando un sistema para consultorios de kinesiología y busca charlar 20 minutos con kines para entender cómo organizan el día a día del consultorio. No vende nada. ¿Te puedo pasar tu contacto?

Reglas: un pedido por intermediario con nombre concreto si se puede ("¿me presentarías a tu kine?"); seguimiento a los 4 días si no hay respuesta; nunca más de dos toques. Registrar cada pedido en el CRM (`etapa = pedido`).

## B. Reglas de no inducción (leer antes de cada charla)

1. **Prohibido nombrar** obra social, prepaga, orden, autorización, token, planilla, agenda, turnos, historia clínica, evolución, cobros, software ni kinesiapp **antes de que el kine lo haga**. Si lo nombra, se repregunta.
2. Las preguntas van **en este orden**. Lo primero que dice en la 1 es `dolor_principal`.
3. Silencio de 3 segundos después de cada respuesta.
4. No corregir, no vender, no "justo estamos haciendo…". Si pregunta qué es: "un sistema para consultorios de kinesiología; después te cuento, primero quiero entender cómo trabajás vos".
5. Anotar textual, entre comillas.
6. Preguntar por hechos pasados ("la última vez", "el mes pasado"), no por deseos.

## Apertura (1 min)

"Gracias por el tiempo. Estoy armando un sistema para consultorios de kinesiología y antes de mostrarle nada a nadie quiero entender cómo funciona un consultorio de verdad. No te vendo nada hoy."

## C. Las 7 preguntas (en orden)

| # | Pregunta | Qué mide |
|---|---|---|
| 1 | *"¿Qué es lo que más te rompe la cabeza del consultorio, aparte de atender?"* | `dolor_principal` → A/B/C/D/E/X |
| 2 | *"Contame el último paciente nuevo que entró: desde que te contactó hasta que terminó la primera sesión."* | Canal, datos que pide, papeles, orden, tiempos |
| 3 | *"¿Cómo cobrás las sesiones? Pensá en el mes pasado: ¿de dónde vino la plata y cuándo llegó?"* | Mezcla particular/OS, demoras, coseguro. **Solo si nombra obra social:** "¿qué tenés que juntar para cobrarle?", "¿cuánto te lleva por mes?", "¿te rebotaron o debitaron algo? ¿por qué?", "¿cómo lo presentás al colegio?" |
| 4 | *"¿Dónde queda anotado lo que hacés en cada sesión? ¿Me mostrás uno, sin datos del paciente?"* | Historia clínica: papel, Word, sistema; evaluación; evoluciones |
| 5 | *"¿Quién más toca la agenda o la plata? ¿Cómo se coordinan?"* | Recepción, equipo, atención simultánea |
| 6 | *"¿Qué probaste para ordenar todo esto? ¿Qué pasó?"* | Competidores, por qué lo dejó |
| 7 | *"Si mañana pudieras cambiar una sola cosa de cómo funciona el consultorio, ¿cuál sería?"* | Confirma o contradice la 1 → `dolor_secundario` |

## D. Observables (anotar sin preguntar, o al final si falta)

Profesionales · recepción · pacientes por día · si atiende a varios a la vez (cuántos por hora) · % obra social aproximado · financiadores principales · especialidad (trauma, deportiva, neuro, respiratoria, pediátrica, piso pélvico) · herramientas actuales · WhatsApp Business sí/no · Instagram activo.

## E. Precio

**Sin Van Westendorp** (descartado en TurnoGol el 2026-09-17: preguntar cuánto pagaría devuelve lo que le conviene, no lo que vale). En esta primera charla, solo si fluyó y al final:

- *"¿Cuánto gastás hoy por mes en herramientas del consultorio (sistema, agenda, lo que sea)?"*

La oferta con precio escrito va en la **segunda vuelta** (semanas 4-5), con el prototipo ([D8](../decisions/2026-10-16-arranque.md)).

## F. Cierre (2 min)

1. *"Me sirvió muchísimo. ¿Te puedo volver a ver en 2-3 semanas para mostrarte algo armado con cómo trabajás vos?"*
2. **Referidos (crítico, el acceso es indirecto):** *"¿Conocés a otro kine o consultorio al que le pase algo parecido? ¿Me lo presentarías?"* — si dice que sí, dejarle el texto reenviable de §A en el momento.

## G. Registro (5 minutos después, no al día siguiente)

- CRM: fila completa, `dolor_principal`, `inducida`, `score`, `proxima_accion` + `fecha_proxima`.
- `data/entrevistas/AAAA-MM-DD-Dnn.md`: textual de las 7 respuestas.
- [`aprendizajes.md`](aprendizajes.md): solo si cambió algo (dolor fuera de A-D, objeción nueva, dato de mercado).
- ESTADO de [`README.md`](README.md): sumar la entrevista.

## H. Lo que hace que una entrevista NO cuente para la cuña

Se registra igual, marcada `inducida = si`, y no suma al "3 de 5" si:
- nombraste vos primero alguno de los temas de §B;
- fue durante o después de mostrar un prototipo;
- es amigo/a o familiar (sesgo de cortesía).
