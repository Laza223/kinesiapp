# Teardown público de Pacientia

**Fecha:** 2026-10-16 · **Método:** solo páginas públicas de https://pacientia.app/ (home, `/terminos-condiciones.html`, `/politica-privacidad.html`, `sitemap.xml`, `robots.txt`). Sin cuenta, sin prueba, sin captura automatizada (ver [D5](../decisions/2026-10-16-arranque.md)). Etiqueta **ANUNCIADO** = lo dice el sitio; no se verificó en el producto.

## Qué es

- "Hecho para consultorios de fisioterapia" / "Tu consultorio de fisioterapia, más claro." Agenda, valoración, evolución y cobros en un lugar.
- Segmento: "consultorios privados pequeños y medianos" que hoy usan "libretas, Excel o WhatsApp". Usuarios: fisioterapeutas y recepción.
- País: México (precios en MXN, WhatsApp +52, testimonio de Querétaro, menciona la norma NOM-035-SSA3-2012).
- Se angostó de médico general a fisio: el `<title>` y la meta descripción todavía dicen "Software para consultorios médicos… Ideal para consultorios en México"; los términos dicen "consultorios médicos y de fisioterapia".

## Funciones anunciadas

| Función | Etiqueta | Plan |
|---|---|---|
| Agenda día / semana / mes | ANUNCIADO | ambos |
| Link de reserva online 24/7, solo huecos libres, bloquea al reservar, se puede pausar | ANUNCIADO | Pro |
| Sincronización con Google Calendar | ANUNCIADO | Pro |
| Expediente de rehabilitación: valoración, notas PSOAP, evolución | ANUNCIADO | ambos |
| Mapa corporal clínico (hallazgos por región) | ANUNCIADO | ambos |
| Archivos y fotos en la nube | ANUNCIADO | ambos |
| Caja: "Reportes simples de caja" (Basic); "Ingresos, egresos y cortes" (Pro) | ANUNCIADO | ambos |
| Equipo: fisios y recepción, invitar usuarios y asignar permisos | ANUNCIADO | — |
| Notas y PDFs con logo | ANUNCIADO | — |
| Exportar a Excel y PDF | ANUNCIADO | — |
| IA: resúmenes, borrador PSOAP, redacción "bajo el marco de la CIF (OMS)", resúmenes para aseguradoras y derivaciones; "La IA no diagnostica" | ANUNCIADO | Pro |
| Web en computadora, tablet y teléfono; nada que instalar | ANUNCIADO | — |

**No menciona:** integración con WhatsApp (solo es canal de contacto), recordatorios, teleconsulta, ejercicios domiciliarios, facturación (CFDI), app nativa, API pública, nada parecido a obras sociales.

## Precio y modelo

- **Basic $499 MXN/mes · Pro $899 MXN/mes** ("Recomendado"). Solo mensual; sin anual ni USD.
- Prueba de 7 días en cualquier plan; según términos, cobro automático por Stripe si no se cancela.
- Límites (usuarios, pacientes, almacenamiento, IA): SIN VERIFICAR, no se publican. Parece precio por consultorio, no por asiento (SIN VERIFICAR).
- Alta self-serve (`my.pacientia.app/sign-up?plan=basic|pro`) + demo asistida ("Te contacto en 24–48 h", en primera persona) + WhatsApp. Sin freemium.
- Consejo de onboarding: empezar solo con los turnos nuevos y convivir 1-2 semanas con el sistema actual.
- Integraciones: Google Calendar y Stripe.

## Señales sobre la empresa (INFERENCIA, no hecho)

- Un solo testimonio (Prekinesis, Querétaro); sin cifras de clientes.
- Sin razón social, dirección ni RFC; el mail de contacto está en el dominio `maxvazquez.dev` → probablemente lo lleva un desarrollador solo.
- Sitio chico: el sitemap lista 3 páginas; `/blog`, `/precios` y `/faq` devuelven la home. Sitemap modificado 2025-12-06; pie © 2026.
- Conclusión: producto joven y sin tracción pública. No es evidencia de que el modelo funcione.

## Términos (https://pacientia.app/terminos-condiciones.html, "Última actualización: 25/9/2026")

- **§3 Prueba:** "Si no cancelas antes de que termine la prueba, se realizará el cobro automático de la suscripción."
- **§4 Uso aceptable**, no podrás: "Modificar, copiar, descompilar o realizar ingeniería inversa del software, salvo en lo permitido por la ley." También: acceder a otros consultorios sin autorización e introducir código malicioso.
- **§9 Suspensión:** pueden cerrar cuentas que "Incumplan estos términos."
- No hay cláusulas explícitas sobre scraping, bots, uso de cuentas de prueba, benchmarking, ley aplicable ni entidad legal.

## Qué tomamos / qué no

| Tomamos | No tomamos |
|---|---|
| Catálogo de funciones mínimas de un software de kinesio (agenda, valoración, evolución, mapa corporal, archivos, caja, equipo, exportar) | Textos, copy, nombres de secciones propias |
| Patrones de UX públicos y genéricos (convivir 1-2 semanas con el sistema anterior, reserva que solo muestra huecos) | Código, assets, ilustraciones, endpoints, estructura de datos |
| Idea de IA como borrador revisable, "no diagnostica" | Su modelo de precios en MXN convertido |
| Prueba + demo asistida como doble camino de alta | Cualquier análisis que requiera cuenta, captura automatizada o ingeniería inversa |
