import type { Contact } from "./types"

const STORAGE_KEY = "crm_telefonico_contacts"

// Funzione utility per ordinare i contatti
export function sortContacts(contacts: Contact[], sortBy: string = "updateStatus"): Contact[] {
  const sortedContacts = [...contacts];
  
  switch (sortBy) {
    case "updateStatus":
      // Se updateAt != createdAt, ordina per updatedAt (più recenti prima)
      // Altrimenti mantiene l'ordine originale
      return sortedContacts.sort((a, b) => {
        const aUpdated = a.updatedAt !== a.createdAt;
        const bUpdated = b.updatedAt !== b.createdAt;
        
        // Se entrambi sono stati aggiornati o entrambi non sono stati aggiornati
        if (aUpdated === bUpdated) {
          // Per quelli aggiornati, mostra i più recenti prima
          if (aUpdated) {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          }
          // Altrimenti, mantieni l'ordine originale (basato sull'ID)
          return a.id.localeCompare(b.id);
        }
        
        // Mostra prima quelli aggiornati
        return aUpdated ? -1 : 1;
      });
    
    case "updatedNewest":
      // Ordina per updatedAt (più recenti prima)
      return sortedContacts.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    
    case "updatedOldest":
      // Ordina per updatedAt (più vecchi prima)
      return sortedContacts.sort((a, b) => 
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      );
    
    case "name":
      // Ordina per nome azienda (A-Z)
      return sortedContacts.sort((a, b) => 
        a.azienda.localeCompare(b.azienda)
      );
    
    default:
      return sortedContacts;
  }
}

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

// Funzione per caricare i contatti dal database con supporto per l'ordinamento
export async function loadContacts(sortBy: string = "updateStatus"): Promise<Contact[]> {
  try {
    // Prova a caricare dal database
    const response = await fetch(`/api/contacts?sortBy=${encodeURIComponent(sortBy)}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Errore nel caricamento dei contatti dal database:", error)
    
    // Fallback a localStorage in caso di errore
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const contacts = JSON.parse(stored);
        return sortContacts(contacts, sortBy);
      }
    }
    return []
  }
}

// Funzione per salvare i contatti nel database
export async function saveContacts(contacts: Contact[]): Promise<Contact[]> {
  try {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contacts),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // Salva anche in localStorage come fallback
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
    }
    
    return contacts
  } catch (error) {
    console.error("Errore nel salvare i contatti nel database:", error)
    
    // Salva solo in localStorage in caso di errore
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
    }
    return contacts
  }
}

// Funzione per aggiornare un contatto
export async function updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact[]> {
  try {
    const response = await fetch('/api/contacts', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: contactId,
        ...updates,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // Aggiorna la cache locale
    const contacts = await loadContacts()
    const index = contacts.findIndex((c) => c.id === contactId)
    
    if (index !== -1) {
      contacts[index] = {
        ...contacts[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      
      // Aggiorna anche in localStorage come fallback
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
      }
    }
    
    return contacts
  } catch (error) {
    console.error("Errore nell'aggiornamento del contatto nel database:", error)
    
    // Fallback a localStorage in caso di errore
    const contacts = loadLocalContacts()
    const index = contacts.findIndex((c) => c.id === contactId)
    
    if (index !== -1) {
      contacts[index] = {
        ...contacts[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
      }
    }
    
    return contacts
  }
}

// Funzione per migrare i contatti da localStorage a MongoDB
export async function migrateContactsToMongoDB(): Promise<{ success: boolean; migrated: number; cleared: boolean }> {
  try {
    // Leggi i contatti dal localStorage
    const contacts = loadLocalContacts()
    
    if (contacts.length === 0) {
      return { success: false, migrated: 0, cleared: false }
    }
    
    // Invia i contatti all'API di migrazione
    const response = await fetch('/api/contacts/migrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contacts }),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    // Se la migrazione è andata a buon fine, pulisci il localStorage
    if (result.success && typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
      return { success: true, migrated: result.migrated, cleared: true }
    }
    
    return { success: result.success, migrated: result.migrated, cleared: false }
  } catch (error) {
    console.error("Errore nella migrazione dei contatti:", error)
    return { success: false, migrated: 0, cleared: false }
  }
}

// Funzione helper per caricare i contatti direttamente da localStorage
function loadLocalContacts(): Contact[] {
  if (typeof window === "undefined") return []
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return []
}
