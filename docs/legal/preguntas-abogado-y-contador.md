# Preguntas para el abogado y el contador

> **No es asesoramiento legal ni contable.** Es el resumen de lo encontrado en investigación de escritorio (2026-10-16) y la lista de preguntas para llevar a profesionales. Fuentes y detalle: [`docs/research/2026-10-16-mercado-y-regulacion.md`](../research/2026-10-16-mercado-y-regulacion.md) §4. Decisión que lo rige: [D10](../decisions/2026-10-16-arranque.md) — **ningún dato real de pacientes antes de esta revisión**.

## Lo que ya sabemos (a confirmar)

- **Ley 26.529** ([texto Decreto 1089/2012](https://www.argentina.gob.ar/normativa/nacional/199296/texto)): HC informatizada válida si asegura integridad, autenticidad, inalterabilidad, perdurabilidad y recuperabilidad (art. 13); el paciente es titular y tiene copia en 48 h (art. 14); el consultorio/profesional es depositario y conserva ≥10 años desde la última actuación (art. 18). El decreto remite a la Ley 25.506 de firma.
- **Ley 25.326** ([texto](https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/texto.htm)): salud = dato sensible; el encargado de tratamiento opera según contrato (art. 25); transferencias solo a países adecuados (art. 12). EE.UU. y Brasil no están en la lista de la [Disp. 60-E/2016](https://www.argentina.gob.ar/normativa/nacional/norma-267922/actualizacion) → cláusulas modelo, p. ej. [Res. AAIP 198/2023](https://www.boletinoficial.gob.ar/detalleAviso/primera/296189/20231018). El registro de bases ante la AAIP seguiría vigente ([JBB](https://jbbabogados.com.ar/registro-de-bases-de-datos-personales-en-argentina-cuando-corresponde-inscribirlas-ante-la-aaip-y-como-hacerlo/)).
- **ReNaPDiS** ([Res. 1959/2024](https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-1959-2024-400825/texto)): obligatorio para plataformas que prescriben (y, con la Res. 2214/2025, que emiten órdenes de prácticas). kinesiapp v1 no prescribe ni hace teleconsulta.
- **Ley 27.706** + Decreto 393/2023 y **CABA Ley 5669**: describen la HC firmada con firma digital del profesional; no se encontró registro obligatorio para proveedores privados.
- **Proveedores previstos:** Supabase (base y auth), Vercel (hosting), y más adelante Resend (mail) y Sentry (errores); todas empresas de EE.UU. Región tentativa: São Paulo.

## Preguntas para el abogado (datos personales y salud)

1. **Roles.** ¿El consultorio es responsable y kinesiapp encargado de tratamiento (art. 25 Ley 25.326)? ¿Qué debe decir el contrato de encargo (finalidad, seguridad, subencargados, destino de los datos al terminar)?
2. **Registro AAIP.** ¿Quién inscribe qué base: cada consultorio la suya, kinesiapp la de sus usuarios, ambas? ¿Podemos dar una guía o un trámite asistido sin asumir responsabilidad?
3. **Transferencia internacional y región.** ¿Alcanza São Paulo + cláusulas de la Res. AAIP 198/2023 con Supabase y Vercel, o conviene región UE? ¿Cómo se tratan los subencargados de EE.UU. (Supabase, Vercel, Resend, Sentry) aunque los datos estén en otra región? ¿Hace falta consentimiento del paciente además del contrato?
4. **Historia clínica electrónica.** Para evoluciones de kinesiología, ¿qué exige el art. 13 Ley 26.529 + art. 13 Decreto 1089/2012? ¿Alcanza firma electrónica (usuario + contraseña + MFA + registro inmutable de versiones con autor y hora) o hace falta firma digital? ¿Qué cambia si el consultorio está en CABA (Ley 5669) o si aplica la Ley 27.706?
5. **Custodia de 10 años.** Si el consultorio deja de pagar, ¿quién conserva la HC y bajo qué condiciones? ¿Es válido un plan "archivo" de solo lectura? ¿Qué pasa si el consultorio cierra o el profesional fallece? ¿Podemos borrar algo alguna vez?
6. **Copia al paciente en 48 h.** ¿Formato aceptable (PDF exportable por el consultorio)? ¿Quién responde al pedido?
7. **Información y consentimiento del paciente.** ¿Qué texto debe usar el consultorio para informar que sus datos se tratan en una plataforma de terceros?
8. **ReNaPDiS.** Si no emitimos órdenes ni hacemos teleconsulta, ¿confirmás que no hay que inscribirse? ¿Registrar la imagen de una orden médica y su número de OME/CUIR cambia algo?
9. **IA a futuro.** Si más adelante un proveedor de IA redacta borradores de evoluciones, ¿qué requisitos (contrato, transferencia, información al paciente)?
10. **Términos, privacidad y responsabilidad.** Términos y política de privacidad, límite de responsabilidad, ¿seguro de responsabilidad o ciberseguro recomendado?
11. **Jurisdicción.** Arrancamos en provincia de Buenos Aires: ¿hay normas provinciales de HC o de kinesiología (Ley 10.392) que agreguen requisitos?
12. **Soporte.** ¿Qué condiciones para que soporte acceda a datos de un consultorio (autorización, auditoría, excepcionalidad)?

## Preguntas para el contador

1. Régimen del founder para facturar kinesiapp (monotributo vs. responsable inscripto; umbrales y efecto en el precio neto — en TurnoGol el neto caía ~38% al pasar a RI).
2. ¿Qué factura se emite a consultorios y profesionales? IVA sobre servicios digitales.
3. Cobro por suscripción de Mercado Pago: retenciones, conciliación, cómo facturar cobros automáticos.
4. ¿Cuándo conviene armar una sociedad (SAS/SRL)?
5. **Investigación de producto:** ¿cómo factura hoy un kinesiólogo monotributista a particulares, obras sociales y al colegio? ¿Integrar Factura C vía ARCA (WSFEv1) le ahorraría tiempo real o ya lo resuelve con el portal?

## Qué llevar a la reunión

- Este documento y [`docs/research/2026-10-16-mercado-y-regulacion.md`](../research/2026-10-16-mercado-y-regulacion.md).
- Esquema de datos previsto: consultorios, miembros con roles, pacientes, evoluciones con versiones, auditoría append-only (ver [`docs/architecture.md`](../architecture.md)).
- Lista de proveedores con país y región, y sus DPA públicos.
- Presupuesto pedido por escrito y plazo: la revisión tiene que estar antes de la semana 4 (D10).
