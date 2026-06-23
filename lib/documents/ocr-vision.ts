import type { OcrExtraction } from "@/lib/documents/ocr-extract"
import { extractDocumentOcr, fetchTextContent } from "@/lib/documents/ocr-extract"

type VisionResponse = {
  responses?: Array<{
    fullTextAnnotation?: { text?: string }
    textAnnotations?: Array<{ description?: string }>
  }>
}

/** OCR con Google Cloud Vision (REST). Requiere GOOGLE_VISION_API_KEY. */
export async function extractTextWithVision(
  fileUrl: string,
  fileType: string
): Promise<string | undefined> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY?.trim()
  if (!apiKey) return undefined
  if (!fileUrl.startsWith("http")) return undefined

  const isImage = fileType.startsWith("image/")
  if (!isImage) return undefined

  try {
    const res = await fetch(fileUrl, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) return undefined
    const buffer = Buffer.from(await res.arrayBuffer())
    const base64 = buffer.toString("base64")

    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64 },
              features: [{ type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 }],
            },
          ],
        }),
        signal: AbortSignal.timeout(30000),
      }
    )

    if (!visionRes.ok) return undefined
    const data = (await visionRes.json()) as VisionResponse
    const text =
      data.responses?.[0]?.fullTextAnnotation?.text ??
      data.responses?.[0]?.textAnnotations?.[0]?.description
    return text?.slice(0, 12000)
  } catch {
    return undefined
  }
}

/** Pipeline OCR: Vision → heurísticas fallback. */
export async function runDocumentOcr(
  name: string,
  fileUrl: string,
  fileType: string,
  plainText?: string
): Promise<OcrExtraction> {
  let text = plainText
  if (!text?.trim()) {
    text = await fetchTextContent(fileUrl, fileType)
  }
  if (!text?.trim()) {
    text = await extractTextWithVision(fileUrl, fileType)
  }
  const extraction = extractDocumentOcr(name, text)
  if (text && extraction.structured.source === "filename") {
    extraction.structured.source = "text"
  }
  if (text && process.env.GOOGLE_VISION_API_KEY) {
    extraction.structured.confidence =
      extraction.structured.subtotal && extraction.structured.amount ? "high" : "medium"
  }
  return extraction
}

export function isVisionConfigured(): boolean {
  return Boolean(process.env.GOOGLE_VISION_API_KEY?.trim())
}
