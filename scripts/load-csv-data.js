// Script per scaricare e processare il file CSV delle aziende
const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aziende_con_telefono-iuKXtxvRgCD2MFzShnsS9iJ0sramFS.csv"

async function loadAndProcessCSV() {
  try {
    console.log("[v0] Scaricando il file CSV...")
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    console.log("[v0] File CSV scaricato, dimensione:", csvText.length, "caratteri")

    // Parse del CSV
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("[v0] Headers trovati:", headers)

    const contacts = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Parse più robusto per gestire virgole nei campi
      const values = []
      let current = ""
      let inQuotes = false

      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(current.trim().replace(/"/g, ""))
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim().replace(/"/g, ""))

      if (values.length >= 2 && values[0] && values[1]) {
        const contact = {
          id: `contact_${i}`,
          azienda: values[0] || "",
          telefono: values[1] || "",
          indirizzo: values[2] || "",
          sito: values[3] || "",
          // Campi operativi
          phone_status: "non_contattato",
          interesse: null,
          reindirizzato: null,
          note: "",
          callbackAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        contacts.push(contact)
      }
    }

    console.log("[v0] Contatti processati:", contacts.length)
    console.log("[v0] Primi 3 contatti:", contacts.slice(0, 3))

    // Salva in localStorage (simulato per lo script)
    console.log("[v0] Dati pronti per essere salvati in localStorage")
    console.log("[v0] Struttura dati finale:", {
      totalContacts: contacts.length,
      sampleContact: contacts[0],
    })

    return contacts
  } catch (error) {
    console.error("[v0] Errore nel caricamento del CSV:", error)
    return []
  }
}

// Esegui il caricamento
loadAndProcessCSV()
