import type { Contact } from "./types"

const STORAGE_KEY = "crm_telefonico_contacts"

export async function loadContactsFromCSV(): Promise<Contact[]> {
  const csvUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aziende_con_telefono-iuKXtxvRgCD2MFzShnsS9iJ0sramFS.csv"

  try {
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    const lines = csvText.split("\n")
    const contacts: Contact[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Parse CSV con gestione delle virgole nei campi
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
        const contact: Contact = {
          id: `contact_${i}`,
          azienda: values[0] || "",
          telefono: values[1] || "",
          indirizzo: values[2] || "",
          sito: values[3] || "",
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

    return contacts
  } catch (error) {
    console.error("Errore nel caricamento del CSV:", error)
    return []
  }
}

export function saveContacts(contacts: Contact[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
  }
}

export function loadContacts(): Contact[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return []
}

export function updateContact(contactId: string, updates: Partial<Contact>): Contact[] {
  const contacts = loadContacts()
  const index = contacts.findIndex((c) => c.id === contactId)

  if (index !== -1) {
    contacts[index] = {
      ...contacts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    saveContacts(contacts)
  }

  return contacts
}
