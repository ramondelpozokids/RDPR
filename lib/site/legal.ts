import { SITE_NAV, FOOTER_LINKS, CONTACT_EMAIL, CEO_NAME, SITE_NAME } from "@/lib/site/config"

/** Datos identificativos del titular — actualizar con datos registrales definitivos. */
export const LEGAL_ENTITY = {
  companyName: "Portfolio Ramón",
  tradeName: SITE_NAME,
  owner: CEO_NAME,
  email: CONTACT_EMAIL,
  privacyEmail: "privacidad@ramondelpozorott.es",
  website: "https://rdpr-uzun.vercel.app",
  country: "España",
  jurisdiction: "España y Unión Europea",
  nif: "Disponible bajo solicitud en info@ramondelpozorott.es",
  address: "España · Domicilio social comunicado en contrato o bajo solicitud",
  activity:
    "Desarrollo y explotación de software empresarial (SaaS), plataformas de gestión, inteligencia artificial aplicada al negocio y servicios digitales asociados.",
  lastUpdated: "22 de junio de 2026",
  version: "1.0",
} as const

export const LEGAL_PAGES = [
  {
    href: "/legal/aviso-legal",
    label: "Aviso legal",
    description: "Titularidad, condiciones de uso y responsabilidades",
  },
  {
    href: "/legal/privacidad",
    label: "Política de privacidad",
    description: "Tratamiento de datos personales y finalidades",
  },
  {
    href: "/legal/cookies",
    label: "Política de cookies",
    description: "Tecnologías de seguimiento y preferencias",
  },
  {
    href: "/legal/proteccion-datos",
    label: "Protección de datos",
    description: "RGPD, LOPDGDD y ejercicio de derechos",
  },
  {
    href: "/legal/mapa-del-sitio",
    label: "Mapa del sitio",
    description: "Índice completo de páginas y recursos",
  },
] as const

export const SITEMAP_SECTIONS = [
  {
    title: "Producto",
    links: [
      ...SITE_NAV.filter((n) => n.href !== "/"),
      ...FOOTER_LINKS.producto,
    ].filter((v, i, a) => a.findIndex((x) => x.href === v.href) === i),
  },
  {
    title: "Empresa",
    links: FOOTER_LINKS.empresa.filter((l) => !l.href.startsWith("mailto:")),
  },
  {
    title: "Acceso",
    links: FOOTER_LINKS.acceso,
  },
  {
    title: "Legal y cumplimiento",
    links: LEGAL_PAGES.map(({ href, label }) => ({ href, label })),
  },
  {
    title: "Cuenta",
    links: [
      { href: "/login", label: "Iniciar sesión" },
      { href: "/register", label: "Registrar empresa" },
      { href: "/dashboard", label: "Panel de control (requiere acceso)" },
    ],
  },
]

export type LegalBlock = {
  id: string
  title: string
  paragraphs: string[]
  list?: string[]
}

function p(...paragraphs: string[]): LegalBlock["paragraphs"] {
  return paragraphs
}

export const AVISO_LEGAL_SECTIONS: LegalBlock[] = [
  {
    id: "identificacion",
    title: "1. Datos identificativos del titular",
    paragraphs: p(
      `En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa a los usuarios de los datos identificativos del titular del presente sitio web y de la plataforma ${LEGAL_ENTITY.tradeName}:`,
    ),
    list: [
      `Denominación social / Titular: ${LEGAL_ENTITY.companyName}`,
      `Nombre comercial: ${LEGAL_ENTITY.tradeName}`,
      `Responsable: ${LEGAL_ENTITY.owner}`,
      `Actividad: ${LEGAL_ENTITY.activity}`,
      `Correo electrónico: ${LEGAL_ENTITY.email}`,
      `Sitio web: ${LEGAL_ENTITY.website}`,
      `Ámbito territorial: ${LEGAL_ENTITY.jurisdiction}`,
      `Identificación fiscal: ${LEGAL_ENTITY.nif}`,
      `Domicilio: ${LEGAL_ENTITY.address}`,
    ],
  },
  {
    id: "objeto",
    title: "2. Objeto y ámbito",
    paragraphs: p(
      `El presente aviso legal regula el acceso, navegación y uso del sitio web y de los servicios digitales asociados a ${LEGAL_ENTITY.tradeName}, una plataforma de software empresarial en modalidad SaaS orientada a la gestión integrada de finanzas, operaciones, clientes, proyectos e inteligencia artificial aplicada al negocio.`,
      `El acceso a la plataforma implica la aceptación sin reservas de las condiciones aquí expuestas, sin perjuicio de los términos contractuales específicos que rijan la relación comercial con cada cliente.`,
    ),
  },
  {
    id: "condiciones-uso",
    title: "3. Condiciones de uso",
    paragraphs: p(
      `El usuario se compromete a utilizar el sitio web y la plataforma de forma diligente, lícita y conforme a la buena fe, absteniéndose de:`,
    ),
    list: [
      "Introducir virus, malware o sistemas que puedan dañar la infraestructura o datos de terceros.",
      "Intentar acceder sin autorización a áreas restringidas, cuentas ajenas o sistemas backend.",
      "Reproducir, distribuir o transformar contenidos propios de RDPR OS sin autorización expresa.",
      "Utilizar la plataforma para fines ilícitos, fraudulentos o contrarios al orden público.",
      "Realizar ingeniería inversa, descompilación o extracción masiva automatizada no autorizada.",
    ],
  },
  {
    id: "propiedad",
    title: "4. Propiedad intelectual e industrial",
    paragraphs: p(
      `Todos los contenidos del sitio web y de la plataforma —incluyendo, a título enunciativo, textos, diseños, logotipos, iconografía, código fuente, bases de datos, interfaces, documentación, marcas y signos distintivos— son propiedad de ${LEGAL_ENTITY.companyName} o de sus licenciantes, y están protegidos por la legislación española e internacional en materia de propiedad intelectual e industrial.`,
      `Queda prohibida su reproducción, distribución, comunicación pública o transformación, total o parcial, salvo autorización previa y por escrito del titular o cuando ello resulte legalmente permitido.`,
    ),
  },
  {
    id: "responsabilidad",
    title: "5. Limitación de responsabilidad",
    paragraphs: p(
      `${LEGAL_ENTITY.companyName} no garantiza la ausencia de interrupciones o errores en el acceso al sitio web, ni que el contenido esté permanentemente actualizado, aunque desarrollará esfuerzos razonables para mantener la disponibilidad y seguridad del servicio.`,
      `La información financiera, contable o de gestión mostrada en ${LEGAL_ENTITY.tradeName} tiene carácter operativo y de apoyo a la decisión empresarial. No constituye asesoramiento fiscal, legal o financiero profesional salvo contratación expresa de dichos servicios.`,
      `${LEGAL_ENTITY.companyName} no será responsable de daños indirectos, lucro cesante o pérdida de datos derivados del uso indebido de la plataforma por parte del usuario o de terceros no autorizados.`,
    ),
  },
  {
    id: "enlaces",
    title: "6. Enlaces externos",
    paragraphs: p(
      `El sitio web puede contener enlaces a sitios de terceros. ${LEGAL_ENTITY.companyName} no controla ni asume responsabilidad por los contenidos, políticas o prácticas de privacidad de dichos sitios. El acceso a enlaces externos se realiza bajo la exclusiva responsabilidad del usuario.`,
    ),
  },
  {
    id: "modificaciones",
    title: "7. Modificaciones",
    paragraphs: p(
      `${LEGAL_ENTITY.companyName} se reserva el derecho de modificar en cualquier momento el presente aviso legal, así como la configuración, funcionalidades o condiciones de acceso al sitio web y a la plataforma, informando de los cambios sustanciales por medios razonables cuando ello sea exigible.`,
    ),
  },
  {
    id: "legislacion",
    title: "8. Legislación aplicable y jurisdicción",
    paragraphs: p(
      `Las presentes condiciones se rigen por la legislación española. Para la resolución de controversias, las partes se someten a los Juzgados y Tribunales que correspondan conforme a la normativa de consumidores y usuarios y demás disposiciones aplicables, sin perjuicio de los fueros imperativos que pudieran corresponder.`,
    ),
  },
]

export const PRIVACIDAD_SECTIONS: LegalBlock[] = [
  {
    id: "responsable",
    title: "1. Responsable del tratamiento",
    paragraphs: p(
      `El responsable del tratamiento de sus datos personales es ${LEGAL_ENTITY.companyName}, representada por ${LEGAL_ENTITY.owner}, con contacto en ${LEGAL_ENTITY.email} y canal específico de privacidad en ${LEGAL_ENTITY.privacyEmail}.`,
    ),
  },
  {
    id: "principios",
    title: "2. Principios aplicables",
    paragraphs: p(
      `Tratamos los datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), aplicando los principios de licitud, lealtad, transparencia, limitación de la finalidad, minimización, exactitud, limitación del plazo de conservación, integridad, confidencialidad y responsabilidad proactiva.`,
    ),
  },
  {
    id: "datos",
    title: "3. Categorías de datos que tratamos",
    paragraphs: p(`En función de su relación con ${LEGAL_ENTITY.tradeName}, podemos tratar:`),
    list: [
      "Datos identificativos: nombre, apellidos, cargo, empresa.",
      "Datos de contacto: correo electrónico, teléfono, dirección profesional.",
      "Datos de acceso: credenciales cifradas, logs de sesión, dirección IP, dispositivo.",
      "Datos empresariales introducidos en la plataforma: clientes, facturas, proyectos, contabilidad, documentos.",
      "Datos de facturación y contratación cuando aplique.",
      "Preferencias de comunicación y consentimientos otorgados.",
    ],
  },
  {
    id: "finalidades",
    title: "4. Finalidades y bases jurídicas",
    paragraphs: p(`Tratamos sus datos para las siguientes finalidades:`),
    list: [
      "Prestación del servicio SaaS y gestión de la cuenta — ejecución contractual (art. 6.1.b RGPD).",
      "Atención de solicitudes, demos y soporte — interés legítimo / medidas precontractuales (art. 6.1.b y 6.1.f).",
      "Facturación, obligaciones fiscales y contables — obligación legal (art. 6.1.c).",
      "Seguridad, prevención de fraude y mejora del servicio — interés legítimo (art. 6.1.f).",
      "Comunicaciones comerciales — consentimiento o relación contractual previa conforme a LSSI (art. 6.1.a).",
      "Funciones de inteligencia artificial sobre datos de su organización — ejecución contractual y configuración del cliente como responsable del contenido empresarial.",
    ],
  },
  {
    id: "destinatarios",
    title: "5. Destinatarios y encargados",
    paragraphs: p(
      `Podemos comunicar datos a proveedores tecnológicos que actúan como encargados del tratamiento (hosting, base de datos, correo, analítica esencial, infraestructura cloud), con contratos que exigen medidas de seguridad equivalentes al RGPD.`,
      `Utilizamos infraestructura en la Unión Europea o con garantías adecuadas (cláusulas contractuales tipo, decisiones de adecuación) cuando exista transferencia internacional.`,
      `No vendemos datos personales a terceros.`,
    ),
  },
  {
    id: "conservacion",
    title: "6. Plazos de conservación",
    paragraphs: p(
      `Conservamos los datos mientras dure la relación contractual y, posteriormente, durante los plazos exigidos por la normativa fiscal, mercantil o de prescripción de responsabilidades. Los logs de seguridad se mantienen por un periodo proporcional (habitualmente 12 meses, salvo incidente).`,
      `Transcurridos dichos plazos, los datos serán suprimidos o anonimizados de forma irreversible.`,
    ),
  },
  {
    id: "derechos",
    title: "7. Sus derechos",
    paragraphs: p(
      `Puede ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento, portabilidad y a no ser objeto de decisiones automatizadas enviando solicitud a ${LEGAL_ENTITY.privacyEmail}, acreditando su identidad.`,
      `Si considera que el tratamiento no se ajusta a la normativa, puede presentar reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).`,
    ),
  },
  {
    id: "menores",
    title: "8. Menores de edad",
    paragraphs: p(
      `${LEGAL_ENTITY.tradeName} está dirigido a profesionales y empresas. No recopilamos intencionadamente datos de menores de 14 años. Si detectamos tal situación, procederemos a su eliminación.`,
    ),
  },
  {
    id: "actualizacion",
    title: "9. Actualización de esta política",
    paragraphs: p(
      `Esta política puede actualizarse para reflejar cambios normativos o funcionales. Publicaremos la versión vigente en esta URL con indicación de fecha de revisión.`,
    ),
  },
]

export const COOKIES_SECTIONS: LegalBlock[] = [
  {
    id: "que-son",
    title: "1. ¿Qué son las cookies?",
    paragraphs: p(
      `Las cookies y tecnologías similares (local storage, píxeles, identificadores de sesión) son archivos o fragmentos de información que se almacenan en su dispositivo cuando visita un sitio web. Permiten recordar preferencias, mantener sesiones seguras y, en su caso, analizar el uso del sitio.`,
    ),
  },
  {
    id: "tipos",
    title: "2. Tipos de cookies que utilizamos",
    paragraphs: p(`En ${LEGAL_ENTITY.website} y la plataforma ${LEGAL_ENTITY.tradeName} clasificamos las cookies así:`),
    list: [
      "Técnicas / necesarias: imprescindibles para autenticación, seguridad CSRF, preferencias de consentimiento y funcionamiento del SaaS. No requieren consentimiento.",
      "De preferencias: recuerdan idioma, empresa activa en sesión o configuración de interfaz.",
      "Analíticas: miden uso agregado para mejorar rendimiento (solo con consentimiento cuando no sean estrictamente necesarias).",
      "De terceros: cookies de proveedores integrados (p. ej. infraestructura de autenticación o pagos), sujetas a sus propias políticas.",
    ],
  },
  {
    id: "detalle",
    title: "3. Cookies concretas",
    paragraphs: p(`Tabla orientativa de cookies propias:`),
    list: [
      "next-auth.session-token — Sesión autenticada — Duración: sesión / según configuración — Tipo: necesaria",
      "rdpr-cookie-consent — Registro de preferencias de cookies — Duración: 12 meses — Tipo: necesaria",
      "company-context — Empresa activa en multi-tenant — Duración: sesión — Tipo: necesaria",
    ],
  },
  {
    id: "gestion",
    title: "4. Cómo gestionar o revocar el consentimiento",
    paragraphs: p(
      `Puede configurar su navegador para bloquear o eliminar cookies. Tenga en cuenta que desactivar cookies técnicas puede impedir el acceso a áreas autenticadas de la plataforma.`,
      `En su primera visita mostramos un banner de cookies donde puede aceptar, rechazar cookies no esenciales o acceder a esta política. Puede modificar su elección en cualquier momento borrando cookies del navegador o contactando a ${LEGAL_ENTITY.privacyEmail}.`,
    ),
  },
  {
    id: "terceros",
    title: "5. Cookies de terceros",
    paragraphs: p(
      `Si integramos servicios de terceros (analítica, mapas, reproductores), estos proveedores pueden instalar sus propias cookies. Le recomendamos consultar sus políticas de privacidad. ${LEGAL_ENTITY.companyName} minimiza el uso de cookies no esenciales y prioriza soluciones privacy-by-design.`,
    ),
  },
  {
    id: "actualizacion",
    title: "6. Actualizaciones",
    paragraphs: p(
      `Esta política de cookies se revisa periódicamente. Última actualización: ${LEGAL_ENTITY.lastUpdated}. Versión ${LEGAL_ENTITY.version}.`,
    ),
  },
]

export const PROTECCION_DATOS_SECTIONS: LegalBlock[] = [
  {
    id: "marco",
    title: "1. Marco normativo",
    paragraphs: p(
      `${LEGAL_ENTITY.companyName} garantiza el cumplimiento del Reglamento General de Protección de Datos (RGPD), la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), y demás normativa sectorial aplicable en ${LEGAL_ENTITY.country}.`,
      `Este documento complementa la Política de Privacidad y desarrolla el compromiso de ${LEGAL_ENTITY.tradeName} con la protección de datos en entornos B2B y multi-tenant.`,
    ),
  },
  {
    id: "roles",
    title: "2. Roles: responsable y encargado",
    paragraphs: p(
      `Cuando usted contrata ${LEGAL_ENTITY.tradeName} para gestionar datos de su empresa (clientes, empleados, facturación), ${LEGAL_ENTITY.companyName} actúa generalmente como Encargado del Tratamiento respecto de esos datos empresariales, y usted como Responsable. Los datos de su cuenta de usuario (login, facturación del servicio) los tratamos como Responsables.`,
      `Disponemos de acuerdos de encargo de tratamiento (DPA) conforme al artículo 28 RGPD para clientes Business y Enterprise.`,
    ),
  },
  {
    id: "medidas",
    title: "3. Medidas de seguridad técnicas y organizativas",
    paragraphs: p(`Implementamos medidas proporcionales al riesgo, incluyendo:`),
    list: [
      "Cifrado en tránsito (TLS/HTTPS) y cifrado de contraseñas.",
      "Aislamiento multi-tenant por empresa (companyId) en base de datos.",
      "Control de acceso basado en autenticación y sesiones.",
      "Copias de seguridad y monitorización de infraestructura cloud.",
      "Principio de minimización: solo recogemos datos necesarios para el servicio.",
      "Revisión periódica de accesos y registros de actividad en operaciones sensibles.",
    ],
  },
  {
    id: "ia",
    title: "4. Tratamiento de datos e inteligencia artificial",
    paragraphs: p(
      `Las funciones de RDPR Intelligence procesan consultas sobre datos ya almacenados en su tenant empresarial para generar respuestas operativas. No utilizamos sus datos empresariales para entrenar modelos públicos de terceros sin consentimiento expreso y contrato específico.`,
      `Las respuestas de IA son orientativas y deben validarse por personal cualificado antes de decisiones críticas (fiscales, legales o financieras).`,
    ),
  },
  {
    id: "violaciones",
    title: "5. Violaciones de seguridad",
    paragraphs: p(
      `Contamos con procedimientos internos de gestión de incidentes. En caso de violación de seguridad que afecte a datos personales, notificaremos a la AEPD y, cuando proceda, a los interesados en el plazo legal establecido, describiendo la naturale del incidente y las medidas adoptadas.`,
    ),
  },
  {
    id: "ejercicio",
    title: "6. Ejercicio de derechos ARSOPOL",
    paragraphs: p(
      `Puede ejercer sus derechos de Acceso, Rectificación, Supresión, Oposición, Portabilidad y Limitación contactando con:`,
    ),
    list: [
      `Correo: ${LEGAL_ENTITY.privacyEmail}`,
      `Asunto: "Ejercicio de derechos RGPD"`,
      `Adjuntar: copia de documento identificativo y especificación del derecho que desea ejercer`,
      `Plazo de respuesta: 1 mes desde la recepción, prorrogable 2 meses en supuestos complejos`,
    ],
  },
  {
    id: "delegado",
    title: "7. Contacto de privacidad",
    paragraphs: p(
      `Para cuestiones relacionadas con protección de datos puede contactar con nuestro canal de privacidad en ${LEGAL_ENTITY.privacyEmail}. En caso de implementar un Delegado de Protección de Datos (DPO) formal, se publicará su contacto en esta sección.`,
    ),
  },
  {
    id: "transferencias",
    title: "8. Transferencias internacionales",
    paragraphs: p(
      `Priorizamos proveedores con datacenters en el Espacio Económico Europeo. Cuando sea necesario transferir datos fuera del EEE, aplicamos Cláusulas Contractuales Tipo aprobadas por la Comisión Europea u otras garantías del capítulo V RGPD.`,
    ),
  },
]
