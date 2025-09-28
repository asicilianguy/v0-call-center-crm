export async function GET() {
  try {
    // Simuliamo il caricamento dei dati CSV
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aziende_con_telefono-iuKXtxvRgCD2MFzShnsS9iJ0sramFS.csv",
    )
    const csvText = await response.text()

    // Parse CSV
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    const contacts = lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line, index) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
        return {
          id: `contact-${index + 1}`,
          nomeAzienda: values[0] || "",
          numeroTelefono: values[1] || "",
          indirizzo: values[2] || "",
          sito: values[3] || "",
          stato: "non_contattato" as const,
          interesse: null,
          reindirizzato: null,
          note: "",
          dataUltimaChiamata: null,
          dataCreazione: new Date().toISOString(),
        }
      })

    return Response.json({
      success: true,
      contacts,
      count: contacts.length,
    })
  } catch (error) {
    console.error("Errore nel caricamento dei contatti:", error)
    return Response.json(
      {
        success: false,
        error: "Errore nel caricamento dei dati",
      },
      { status: 500 },
    )
  }
}
