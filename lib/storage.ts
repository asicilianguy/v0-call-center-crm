// lib/storage.ts
import type { Contact } from '@/lib/types';

const STORAGE_KEY = 'crm_contacts';

// Funzione per ordinare i contatti
function sortContacts(contacts: Contact[], sortBy: string = "updateStatus"): Contact[] {
  // Clona l'array per non modificare quello originale
  const sortedContacts = [...contacts];
  
  switch (sortBy) {
    case "updateStatus":
      // Se updateAt != createdAt, ordina per updatedAt (più recenti prima)
      return sortedContacts.sort((a, b) => {
        const aUpdated = a.updatedAt !== a.createdAt;
        const bUpdated = b.updatedAt !== b.createdAt;
        
        if (aUpdated === bUpdated) {
          if (aUpdated) {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          }
          return a.id.localeCompare(b.id);
        }
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
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aziende_con_telefono-iuKXtxvRgCD2MFzShnsS9iJ0sramFS.csv";

  try {
    const response = await fetch(csvUrl);
    const csvText = await response.text();

    const lines = csvText.split("\n");
    const contacts: Contact[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse CSV con gestione delle virgole nei campi
      const values = [];
      let current = "";
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim().replace(/"/g, ""));
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/"/g, ""));

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
        };
        contacts.push(contact);
      }
    }

    return contacts;
  } catch (error) {
    console.error("Errore nel caricamento del CSV:", error);
    return [];
  }
}

// Funzione per caricare i contatti dal database con supporto per la paginazione
export async function loadContacts(
  page: number = 1, 
  pageSize: number = 20, 
  sortBy: string = "updateStatus", 
  filters: Record<string, string> = {}
): Promise<{ contacts: Contact[]; totalCount: number }> {
  try {
    // Costruisci l'URL con i parametri di paginazione e ordinamento
    let url = `/api/contacts?page=${page}&pageSize=${pageSize}&sortBy=${encodeURIComponent(sortBy)}`;
    
    // Aggiungi filtri all'URL se presenti
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'tutti') {
        url += `&${key}=${encodeURIComponent(value)}`;
      }
    });
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Errore nel caricamento dei contatti dal database:", error);
    return { contacts: [], totalCount: 0 };
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
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return contacts;
  } catch (error) {
    console.error("Errore nel salvare i contatti nel database:", error);
    return [];
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
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Ricarica i contatti dopo l'aggiornamento
    const { contacts } = await loadContacts();
    return contacts;
  } catch (error) {
    console.error("Errore nell'aggiornamento del contatto nel database:", error);
    return [];
  }
}

// Funzione per inizializzare il database con i dati del CSV
export async function initializeDatabase(): Promise<{ success: boolean; count: number }> {
  try {
    // Carica i contatti dal CSV
    const contacts = await loadContactsFromCSV();
    
    if (contacts.length === 0) {
      return { success: false, count: 0 };
    }
    
    // Invia i contatti all'API per il salvataggio
    const response = await fetch('/api/contacts/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contacts }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return { success: true, count: result.inserted || 0 };
  } catch (error) {
    console.error("Errore nell'inizializzazione del database:", error);
    return { success: false, count: 0 };
  }
}
