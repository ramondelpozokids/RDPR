/** Respuestas FAQ para clientes del portal (sin LLM). */
const FAQ: Array<{ keywords: string[]; answer: string }> = [
  {
    keywords: ["documento", "subir", "upload", "archivo"],
    answer:
      "Puede subir documentos en la sección Documentos. Formatos admitidos: PDF e imágenes. Su gestoría los revisará y clasificará automáticamente.",
  },
  {
    keywords: ["firma", "autorizacion", "autorización", "firmar"],
    answer:
      "En Firmas verá las solicitudes pendientes. Debe firmar la autorización para que la gestoría pueda actuar en su nombre ante Hacienda y Seguridad Social.",
  },
  {
    keywords: ["impuesto", "iva", "irpf", "modelo", "hacienda"],
    answer:
      "En Resumen fiscal encontrará una vista orientativa de sus obligaciones. Las presentaciones oficiales las realiza su gestoría y quedarán registradas en su expediente.",
  },
  {
    keywords: ["banco", "cuenta", "iban", "movimiento"],
    answer:
      "En Banco puede registrar su IBAN para conciliación. La conexión automática (Open Banking) estará disponible próximamente.",
  },
  {
    keywords: ["mensaje", "contacto", "gestor", "asesor"],
    answer:
      "Use Mensajes para comunicarse con su gestoría. Recibirá respuesta en el mismo hilo.",
  },
  {
    keywords: ["onboarding", "alta", "registro", "empezar"],
    answer:
      "Complete el asistente de alta en Onboarding: datos fiscales, identidad, firma de autorización y opcionalmente su cuenta bancaria.",
  },
]

export function answerPortalFaq(question: string): string {
  const t = question
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  for (const item of FAQ) {
    if (item.keywords.some((k) => t.includes(k))) return item.answer
  }

  return "No encontré una respuesta exacta. Escriba a su gestoría en Mensajes o contacte con su asesor asignado."
}
