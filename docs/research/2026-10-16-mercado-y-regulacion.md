# Mercado y regulación: kinesiología en Argentina

**Fecha:** 2026-10-16 · **Advertencia de método:** las fuentes se leyeron desde extractos de buscador (el lector de páginas falló por DNS en todos los dominios). Verificar cada número contra la fuente antes de usarlo en una oferta, una decisión de precio o un texto legal. Lo no corroborado dice **SIN VERIFICAR**.

## 1. Competidores

| Producto | Segmento | Funciones relevantes | Precio publicado | Tracción |
|---|---|---|---|---|
| [AgendaPro](https://agendapro.com/ar/kinesiologos/software-para-kinesiologos) | Reservas + ficha, cualquier especialidad, LatAm | Reserva online, recordatorios WhatsApp/SMS/email, reporte de ingresos. Sin flujo de obra social encontrado | Individual $13.900, Básico $33.900, Premium $44.900/mes con IVA ([planes](https://agendapro.com/ar/planes); revisado 19/9/2026 según [turnoapp](https://turnoapp.com.ar/blog/alternativa-a-agendapro)). WhatsApp como adicional (~50 mensajes por US$7 / $7.900) | Dice >135k profesionales |
| [RivoClin](https://rivoclin.com/soluciones/kinesiologia.html) | AR, kinesiología | Sesiones autorizadas vs. realizadas por obra social con alertas; planes de rehab digitales; "WhatsApp IA" | SIN VERIFICAR | SIN VERIFICAR |
| [KLIA](https://www.klia.com.ar/) | AR; kinesiólogos, psicólogos, médicos | Agenda, HCE, cobros con Mercado Pago, modo multipaciente (30+ por día), prueba 21 días | SIN VERIFICAR | SIN VERIFICAR |
| [Citalo](https://www.citalo.app/ar/agenda-fisioterapeutas-online) | AR, reservas | Separa sesiones cubiertas por obra social/prepaga de particulares | SIN VERIFICAR | SIN VERIFICAR |
| [Control Salud](https://articulo.mercadolibre.com.ar/MLA-633147179-software-agenda-turnos-consultorios-clinicas-kinesiologia-_JM) | AR, HC + turnos | Sesiones contra cada orden, órdenes a facturar por financiador, pago por lote, liquidación por profesional | SIN VERIFICAR | SIN VERIFICAR |
| [GOC HC y Turnos](https://apps.apple.com/us/app/id1120732828) | AR, app iOS | Liquidaciones a obra social y particulares, nomenclador | US$9,99/mes o US$99,99/año | SIN VERIFICAR |
| [VitalDesk](https://vitaldesk.cl/ciudades/buenos-aires/kinesiologo) | Chile, landings AR | Evaluación kinésica (EVA, goniometría, Daniels) | Starter $35.834, Pro $54.167 (hasta 5 profesionales) + IVA; moneda SIN VERIFICAR | SIN VERIFICAR |
| [Turnito](https://turnito.app/ar/app-turnos-medicos/) | AR, reservas | Plan gratis (3 agendas, 100 reservas/mes) | Advance $24.500/mes | SIN VERIFICAR |
| [Medicloud](https://medicloud.com.ar/), DrApp ([Forbes AR](https://www.forbesargentina.com/negocios/10-promesas-como-drapp-plataforma-gestion-consultorios-medicos-ya-aspira-expandirse-latam-n4674)), Doctoralia | Médico general | Receta electrónica + HCE; DrApp: CABA, 2015, telemedicina | Medicloud PRO $14.400 / Team $22.400; DrApp ~$26.900 + IVA; Doctoralia ~$25.000, todo SIN VERIFICAR ([blog Turnito](https://turnito.app/blog/las-mejores-apps-de-turnos-para-medicos-en-argentina-2026/)) | DrApp en Forbes AR |
| [MedicAI](https://www.capterra.com/p/10043571/MedicAI/) | AR, médico general | Factura ARCA integrada; receta en ReNaPDiS N° 292 | Desde US$19/usuario/mes | SIN VERIFICAR |
| [Physitrack](https://www.physitrack.com/pricing) | Global, ejercicios domiciliarios | Planes de ejercicio, telesalud; sin obra social | ~US$19-24/profesional/mes | Global |
| [MrTurno](https://www.uncuyo.edu.ar/prensa/upload/2022-12-01-onepager-mrturno.pdf) | AR, portal de turnos | Recordatorios email y WhatsApp | SIN VERIFICAR | 1.321 profesionales, 25k reservas/mes (2022) |

También: [Docfav](https://pro.docfav.com/es-ar/software-para-kinesiologos) (paquetes y pagos, sin ARCA), [TurnosIA](https://turnosia.app/software-para-kinesiologos/), [ClinIA](https://www.clinia.com.ar/software-gestion-centros-de-salud) (dice facturar a obras sociales y PAMI + ARCA), [Gestión Salud](https://www.gestionsalud.com.ar/) ($26.000 + IVA por asiento, SIN VERIFICAR), [KineTurnos](https://github.com/Matiglorioso/kineturnos) (open source). Las plataformas de colegios (p. ej. COKIBA) son el canal obligatorio de presentación, no software de gestión; sin API pública encontrada.

**Lectura:** mercado fragmentado entre productos chicos; la agenda genérica ya la tiene AgendaPro; el control de órdenes ya lo atacan RivoClin y Control Salud.

## 2. Cómo se cobra la kinesiología

**Flujo típico con obra social / prepaga:**
1. Orden médica con diagnóstico y cantidad de sesiones.
2. Elegibilidad o autorización: validador web o token generado por el paciente.
3. Cada sesión se registra y firma: planilla de asistencia en papel o token. Los colegios publican planillas por financiador ([Círculo D9](https://www.kinesiologosd9.org.ar/planillas.php)).
4. Presentación mensual vía colegio, círculo o red de prestadores.
5. Auditoría del financiador; paga menos débitos y la retención del colegio (porcentaje SIN VERIFICAR).

Financiadores: obras sociales, prepagas, mutuales, ART e IOMA ([reglamento COKIBA](https://www.cokiba.org.ar/wp-content/uploads/2022/06/reglamento_de_beneficio.pdf)).

**Piso de cobertura:** el PMO garantiza hasta 25 sesiones de kinesiología por año; sin tope con CUD ([argentina.gob.ar](https://www.argentina.gob.ar/node/160088), [iProfesional](https://www.iprofesional.com/health-tech/279140-programa-medico-obligatorio-que-obligaciones-tienen-las-obras-sociales-frente-a-los-pacientes)).

**Provincia de Buenos Aires (COKIBA):**
- Entrar al sistema de obras sociales exige matrícula al día, ARCA, registro de prestadores de la SSS, consultorio habilitado, cuenta en Banco Provincia y ARBA; hay que atender a todos los financiadores con convenio ([PDF](https://www.cokiba.org.ar/wp-content/uploads/2022/06/inscripcion_nomina_de_prestadores-1.pdf)).
- Facturación online; los tratamientos deben llegar a auditoría dentro de 60 días del inicio; los borradores nunca se facturan ([FAQ](https://www.cokiba.org.ar/pregunta-frecuentes-autorizacion-de-prestaciones)); acepta imágenes de la orden ([facturación por imágenes](https://www.cokiba.org.ar/actualidad/obras-sociales/facturacion-por-imagenes-03-12-2021)).
- Vigencia de la orden según financiador: Ámsterdam Salud 30 días sin planilla ([manual](https://www.cokiba.org.ar/manuales-de-uso-amsterdam-salud)); AVALIAN 60 días, después rechazo automático ([Informe 20](https://www.cokiba.org.ar/actualidad/obras-sociales/informe-n18-5-08-14-2026)).
- Carga el mismo día obligatoria para AMFFA, Ámsterdam, AVALIAN y CASA ([Informe 11](https://www.cokiba.org.ar/actualidad/obras-sociales/informe-n11-4-05-19-2026)).
- Tokens: el de Swiss Medical vale como firma digital del paciente y la fecha debe coincidir con la atención ([Informe 34](https://www.cokiba.org.ar/actualidad/informe-n-34-token-swiss-medical-10-22-2020)); si aparece copago al validar, el profesional lo cobra y se descuenta del pago ([Círculo D9](https://www.kinesiologosd9.org.ar/obra-social.php?id=20)); el token de AMFFA vence a los 5 minutos.
- Cambios 2026: Swiss Medical exige matrícula del médico prescriptor desde el 21/9 ([Informe 23](https://www.cokiba.org.ar/actualidad/obras-sociales/informe-n23-4-09-18-2026)); Galeno exige credencial digital del paciente desde el 1/9 ([Informe 21](https://www.cokiba.org.ar/actualidad/obras-sociales/informe-n21-4-08-28-2026)); MEDIFE cambió niveles de autorización ([Informe 25](https://www.cokiba.org.ar/actualidad/obras-sociales/informe-n25-4-10-09-2026)). ~25 boletines en 2026: las reglas cambian casi cada semana.

**IOMA** ([IOMA](https://www.ioma.gba.gob.ar/index.php/servicios-y-prestaciones/kinesiologia/)): libre elección entre adheridos; el paciente paga un "bono kinésico" por 10 sesiones; lleva DNI, orden y resumen de historia; módulos por patología; excepciones a auditoría. En 2025 reemplazó planillas en papel por token del paciente para acompañantes terapéuticos ([instructivo](https://www.ioma.gba.gob.ar/wp-content/uploads/2025/09/INSTRUCTIVO-TOKEN-AT_modificado.pdf)): esa es la dirección.

**PAMI:** kinesiología es "Módulo 4"; el afiliado va al prestador de su cartilla con orden médica electrónica (OME) ([Disp. 156/2024](http://institucional.pami.org.ar/files/boletines_inssjp/DI-2024-156-INSSJP-GPM-INSSJP.pdf)); kinesiología domiciliaria (código 250121) autoautorizada hasta 40 sesiones ([Disp. 939/2025](http://institucional.pami.org.ar/files/boletines_inssjp/DI-2025-939-INSSJP-GPM-INSSJP.pdf)). Según una red de prestadores ([UEP, feb-2025](https://uep.com.ar/intranet/admin/capacitaciones/archivos/20250210_ome--orden-medica-electronica-.pdf)): códigos 250101/102/120/121 requieren OME; topes 14 sesiones/mes y 40/año por afiliado; máximo 10 por orden; lo excedido se debita "fuera de rango". La contratación varía por provincia: el colegio de Catamarca no tiene convenio con PAMI desde 2021 ([El Esquiú](https://www.elesquiu.com/sociedad/2026/5/20/kinesiologos-denuncian-que-pami-no-tiene-cobertura-traves-del-colegio-desde-2021-582607.html)).

**Otras provincias:** en Corrientes el paciente firma cada sesión con fecha y la orden vale 60 días desde la primera sesión ([colegio](http://www.colegioklgosctes.com.ar/obras_sociales.php)). Orden vencida = rechazo no refacturable (guía para médicos, [Círculo Médico Paraná](https://www.cmparana.com.ar/wp-content/uploads/2026/06/Instructivo-facturacion-de-obras-sociales.pdf)).

**Aranceles y demoras:** en Misiones PAMI paga ~$5.000 por sesión contra $18.600 de referencia; IOSFA suspendido por deuda ([misionesonline](https://misionesonline.net/2026/04/14/kinesiologos-situacion-critica-pami-fuerzas-armadas/)). Demoras de hasta 90 días ([Primera Edición](https://www.primeraedicion.com.ar/nota/100595503/kinesiologos-por-bajos-aranceles-de-las-obras-sociales-piden-cobrar-un-coseguro/)). Aranceles de colegios (mar-2026): ~$3.570-8.500 por sesión ([1](https://regional4.org.ar/wp-content/uploads/2026/03/ARANCELES-1.pdf), [2](https://www.kinesiocatamarca.org.ar/descargar/aranceles.pdf)).

**Órdenes electrónicas:** la Res. 2214/2025 extiende la prescripción electrónica a prácticas; un resumen de estudio jurídico incluye sesiones de kinesiología. Las órdenes deben salir de plataformas inscriptas en ReNaPDiS con CUIR ([texto](https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-2214-2025-415349/texto), [resumen](https://saucedo-asociados.com.ar/2025/07/25/resumen-informativo-resolucion-2214-2025-del-ministerio-de-salud-de-la-nacion/)).

**SIN VERIFICAR:** proporción particular vs. obra social en kinesiología. Proxy: Censo 2022, 60,9% de la población con obra social o prepaga (incluye PAMI), 81,5% en CABA ([informe](https://www.estadisticaciudad.gob.ar/eyc/wp-content/uploads/2024/07/IR_2024_1880.pdf)). Intermediario de facturación en CABA y existencia de federación nacional: SIN VERIFICAR.

## 3. Tamaño de mercado

- ~42.800 kinesiólogos/fisios en ejercicio (estimación), 9,37 cada 10.000 habitantes ([World Physiotherapy](https://world.physio/membership/argentina)). Un estudio de 2015 daba 3,3 cada 10.000 ([Neurol. Arg.](https://www.elsevier.es/es-revista-neurologia-argentina-301-pdf-download-S1853002815000828)).
- Cifra oficial del Ministerio: SIN VERIFICAR ([informe 2019](https://www.argentina.gob.ar/sites/default/files/informe_fdt_datos2019_vf-1.pdf)).
- COKIBA ">9.000 matriculados" y Salta ">1.300": SIN VERIFICAR (solo extractos).
- ~35 universidades dan la carrera ([buscouniversidad](https://www.buscouniversidad.com.ar/carrera-kinesiologia.html)). Egresados por año y cantidad de consultorios: SIN VERIFICAR.

## 4. Regulación

**Ley 26.529 (derechos del paciente)** + Decreto 1089/2012 ([texto](https://www.argentina.gob.ar/normativa/nacional/199296/texto)):
- Art. 13: historia clínica informatizada válida si asegura integridad, autenticidad, inalterabilidad, perdurabilidad y recuperabilidad; acceso restringido con claves, almacenamiento no reescribible y control de modificación de campos.
- Art. 14: el paciente es titular; copia en 48 h.
- Art. 18: el profesional o establecimiento es depositario; conservación mínima 10 años desde la última actuación. Proyecto para bajar a 5 años, estado SIN VERIFICAR ([1787-D-2022](https://www4.hcdn.gob.ar/dependencias/dsecretaria/Periodo2022/PDF2022/TP2022/1787-D-2022.pdf)).
- Decreto 1089/2012, art. 13: debe ajustarse a la Ley 25.506 de firma.

**Ley 25.326 (datos personales)** ([texto](https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/texto.htm)):
- Salud = dato sensible; art. 8 permite tratarlo a profesionales bajo secreto.
- Art. 25: el encargado solo usa los datos según contrato y los destruye al terminar (o los guarda hasta 2 años si se autoriza).
- Art. 12: prohíbe transferir a países sin protección adecuada. Lista de la [Disp. 60-E/2016](https://www.argentina.gob.ar/normativa/nacional/norma-267922/actualizacion): UE/EEE, Reino Unido, Suiza, Guernsey, Jersey, Isla de Man, Feroe, Andorra, Nueva Zelanda, Uruguay, Israel (datos automatizados) y Canadá (sector privado). **EE.UU. y Brasil no están**: hace falta cláusula modelo (anexo de la Disp. 60-E o cláusulas iberoamericanas de la [Res. AAIP 198/2023](https://www.boletinoficial.gob.ar/detalleAviso/primera/296189/20231018)).
- Registro de bases ante la AAIP (art. 21) sigue apareciendo como obligatorio ([JBB](https://jbbabogados.com.ar/registro-de-bases-de-datos-personales-en-argentina-cuando-corresponde-inscribirlas-ante-la-aaip-y-como-hacerlo/)); la [Res. 180/2025](https://www.argentina.gob.ar/normativa/nacional/norma-418054/texto) derogó otros registros.
- Sin ley nueva: proyectos 1751-D-2026 y 3397-D-2026 sin dictamen al 26/9/2026 ([Marval](https://www.marval.com/publicacion/nuevo-proyecto-de-ley-de-proteccion-de-datos-17691)).

**Ley 27.706 (HC digital federal)** + [Decreto 393/2023](https://www.argentina.gob.ar/normativa/nacional/decreto-393-2023-387475/texto): el Ministerio provee software (HSI) e interoperabilidad; el alcance a privados queda a reglamentación futura. No se encontró régimen de registro o certificación para proveedores privados (SIN VERIFICAR). CABA: Ley 5669 + Decreto 218/2023 ([BO CABA](https://boletinoficial.buenosaires.gob.ar/normativaba/norma/340001)).

**ReNaPDiS** ([Res. 1959/2024](https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-1959-2024-400825/texto); trámite por TAD, [Disp. 1/2024](https://www.argentina.gob.ar/normativa/nacional/disposici%C3%B3n-1-2024-401014/texto)): obligatorio para plataformas que prescriben y repositorios de recetas (con la Res. 2214/2025, también órdenes de prácticas). Telesalud "puede" inscribirse. No se encontró obligación para un software de gestión que no prescribe (SIN VERIFICAR; confirmar con DNSISA).

**Ley 24.317 (ejercicio de la kinesiología)** ([texto](https://www.argentina.gob.ar/normativa/nacional/norma-716/texto)): el paciente enfermo llega por derivación médica. Obligación específica de registro: SIN VERIFICAR. PBA tiene Ley 10.392 y Decreto 3091/97.

**Firma (Ley 25.506)** ([texto](https://www.argentina.gob.ar/normativa/nacional/norma-70749/actualizacion)): firma electrónica → si se desconoce, prueba quien la invoca (art. 5); firma digital → presunción de autoría e integridad (arts. 7-8). Ley 27.706 y Ley 5669 de CABA describen la HC firmada con firma *digital* del profesional. Decreto 743/2024 habilita validación biométrica remota para certificados ([Marval](https://www.marval.com/Publicacion/se-actualiza-la-reglamentacion-de-la-firma-digital-16911?lang=es)).

**Impuestos:** el kinesiólogo típico es monotributista y emite Factura C; escalas indexadas por IPC semestral, +16,8% en ago-2026 ([LM Neuquén](https://www.lmneuquen.com/pais/arca-actualizo-los-montos-del-monotributo-las-nuevas-escalas-y-topes-facturacion-agosto-2026-n1247656)). El web service WSFEv1 de ARCA cubre Factura C ([guía](https://developargentina.com/blog/automatizar-facturacion-arca-2026-paso-paso)). Una fuente secundaria dice que desde el 1/12/2026 ARCA rechaza facturas sin condición de IVA del comprador ([TributoSimple](https://tributosimple.com/arca-rechazara-facturas-electronicas-si-no-informas-la-condicion-frente-al-iva-de-tu-cliente/)), SIN VERIFICAR. Cómo factura el profesional al colegio: SIN VERIFICAR.

## 5. Cobro del SaaS

- Mercado Pago permite cambiar el monto de una suscripción existente con `PUT /preapproval/{id}` (`auto_recurring.transaction_amount`, `currency_id`) ([docs](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/subscription-management)); desde el panel, "Modificar monto" avisa por mail al suscriptor ([planes](https://www.mercadopago.com.ar/developers/es/docs/subscription-plans/manage-subscription-plan)). Prorrateo y consentimiento: SIN VERIFICAR.
- Inflación: 1,9% en sep-2026, 33,4% interanual ([Diario Panorama](https://diariopanorama.com/noticia/569591/indec-confirmo-inflacion-septiembre-fue-19porciento-acumula-334porciento-doce-meses)); REM espera ~30% para 2026 ([resumen](https://ecosistemastartup.com/?p=115705)).
- Práctica observada: precios en ARS con subas ad hoc (Turnito $21,4k → $24,5k; AgendaPro $9,8k → $13,9k); herramientas de nicho o extranjeras en USD. No se encontró cláusula de indexación publicada.
- Banda: un profesional, gratis a ~ARS 14-45k/mes; equipos ~ARS 34-54k+.

## 6. Recordatorios por WhatsApp

- Meta cobra por plantilla entregada desde jul-2025. Argentina: utilidad ~US$0,026, marketing ~US$0,0618 ([Zernio](https://zernio.com/whatsapp-api-pricing), [Mercately](https://blog.mercately.com/?p=30248)); algunas tablas dan US$0,0299 en oct-2026: confirmar en la [tarifa de Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing).
- Desde el 1/10/2026 también se cobran respuestas dentro de la ventana de 24 h, después de ~1.000 gratis por número por mes (según proveedores, p. ej. [YCloud](https://www.ycloud.com/blog/whatsapp-api-message-pricing-update-effective-october-1-2026)).
- Cuenta sin verificar: 250 contactos únicos cada 24 h; para escalar hace falta verificación de negocio ([Chatarmin](https://chatarmin.com/en/blog/whats-app-messaging-limits)).
- Cuentas: ~500 sesiones/mes con un recordatorio cada una ≈ US$13/mes, casi el precio del plan.

## 7. Implicancias para el producto

1. **No prometer "facturación a obras sociales".** La presentación pasa por plataformas de colegio con tokens y carga en el día, sin API. Lo construible es un control de órdenes y autorizaciones: autorizadas vs. usadas, vencimientos, topes (PMO, PAMI), token y copago por sesión, matrícula del prescriptor, número de OME/CUIR, imagen de la orden, conciliación de pagos y débitos. Es la cuña A ([D3](../decisions/2026-10-16-arranque.md)).
2. **Una sola jurisdicción** (PBA vía COKIBA por defecto) y reglas por financiador en una tabla editable sin deploy: cambian casi cada semana.
3. **La plata puede estar en los particulares** (cuña B): obras sociales pagan poco y tarde. Validar la mezcla en entrevistas.
4. **Cumplimiento desde el modelo de datos:** evoluciones con versiones y sin borrado, copia al paciente en un clic, salida de archivo por 10 años tras la baja (posible plan "archivo" barato), contrato de encargado, región con cláusulas modelo o UE, ayuda con el registro AAIP, sin prescripción ni teleconsulta en v1.
5. **Firma:** electrónica con autenticación fuerte y registro inmutable en v1; firma digital como opción posterior. Confirmar con abogado ([preguntas](../legal/preguntas-abogado-y-contador.md)).
6. **WhatsApp puede comerse el margen:** empezar con links `wa.me`; recordatorios automáticos por semana o por serie, con tope por plan o como adicional.
7. **Precio en ARS con ajuste trimestral** y descuento anual; diferenciarse en el flujo kinésico, no en agenda genérica (eso ya es de AgendaPro).
