export type PhoneStatus = "non_contattato" | "non_ha_risposto" | "da_richiamare" | "contattato"
export type InterestLevel = "si" | "no" | "forse" | null
export type RedirectStatus = "si" | "no" | "forse" | null

export interface Contact {
  id: string
  azienda: string
  telefono: string
  indirizzo?: string
  sito?: string
  // Campi operativi
  phone_status: PhoneStatus
  interesse: InterestLevel
  reindirizzato: RedirectStatus
  note: string
  callbackAt: string | null
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface FilterState {
  phone_status: PhoneStatus | "tutti"
  interesse: InterestLevel | "tutti"
  reindirizzato: RedirectStatus | "tutti"
  isPinned: boolean | "tutti"
}
