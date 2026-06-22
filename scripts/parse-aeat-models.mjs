import fs from "fs"

const html = fs.readFileSync("scripts/aeat-models.html", "utf8")
const base = "https://sede.agenciatributaria.gob.es"
const re =
  /href="(\/Sede\/procedimientoini\/[^"]+)"[^>]*>\s*Modelo\s+([^<]+?)<\/a><p class="small mt-1 w-100 mb-3">([\s\S]*?)<\/p>/gi

const models = []
let m
while ((m = re.exec(html)) !== null) {
  const code = m[2].trim().replace(/\s+/g, " ")
  const description = m[3]
    .replace(/&oacute;/g, "ó")
    .replace(/&aacute;/g, "á")
    .replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í")
    .replace(/&uacute;/g, "ú")
    .replace(/&ntilde;/g, "ñ")
    .replace(/&uuml;/g, "ü")
    .replace(/&Aacute;/g, "Á")
    .replace(/&Eacute;/g, "É")
    .replace(/&Iacute;/g, "Í")
    .replace(/&Oacute;/g, "Ó")
    .replace(/&Uacute;/g, "Ú")
    .replace(/&Ntilde;/g, "Ñ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
  models.push({
    code,
    url: base + m[1],
    description,
  })
}

fs.writeFileSync("lib/site/aeat-official-models.json", JSON.stringify(models, null, 2))
console.log(`Parsed ${models.length} models`)
