"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Phone, Globe, MapPin, Calendar, Clock } from "lucide-react"
import type { Contact, PhoneStatus, InterestLevel, RedirectStatus } from "@/lib/types"

interface ContactCardProps {
  contact: Contact
  onUpdate: (contactId: string, updates: Partial<Contact>) => void
}

const phoneStatusLabels: Record<PhoneStatus, string> = {
  non_contattato: "Non Contattato",
  non_ha_risposto: "Non Ha Risposto",
  da_richiamare: "Da Richiamare",
  contattato: "Contattato",
}

const phoneStatusColors: Record<PhoneStatus, string> = {
  non_contattato: "bg-gray-100 text-gray-800",
  non_ha_risposto: "bg-yellow-100 text-yellow-800",
  da_richiamare: "bg-blue-100 text-blue-800",
  contattato: "bg-green-100 text-green-800",
}

export function ContactCard({ contact, onUpdate }: ContactCardProps) {
  const [callbackDate, setCallbackDate] = useState(
    contact.callbackAt ? new Date(contact.callbackAt).toISOString().slice(0, 16) : "",
  )
  const [note, setNote] = useState(contact.note)

  const handlePhoneStatusChange = (status: PhoneStatus) => {
    const updates: Partial<Contact> = { phone_status: status }

    // Reset campi se non è contattato
    if (status !== "contattato") {
      updates.interesse = null
      updates.reindirizzato = null
    }

    // Reset callback se non è da richiamare
    if (status !== "da_richiamare") {
      updates.callbackAt = null
      setCallbackDate("")
    }

    onUpdate(contact.id, updates)
  }

  const handleCallbackDateChange = (date: string) => {
    setCallbackDate(date)
    onUpdate(contact.id, { callbackAt: date ? new Date(date).toISOString() : null })
  }

  const handleNoteChange = (newNote: string) => {
    setNote(newNote)
    onUpdate(contact.id, { note: newNote })
  }

  const handleInterestChange = (interesse: InterestLevel) => {
    onUpdate(contact.id, { interesse })
  }

  const handleRedirectChange = (reindirizzato: RedirectStatus) => {
    onUpdate(contact.id, { reindirizzato })
  }

  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground mb-2">{contact.azienda}</CardTitle>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <a href={`tel:${contact.telefono}`} className="hover:text-primary">
                  {contact.telefono}
                </a>
              </div>
              {contact.sito && (
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <a
                    href={contact.sito.startsWith("http") ? contact.sito : `https://${contact.sito}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary"
                  >
                    Sito Web
                  </a>
                </div>
              )}
              {contact.indirizzo && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{contact.indirizzo}</span>
                </div>
              )}
            </div>
          </div>
          <Badge className={phoneStatusColors[contact.phone_status]}>{phoneStatusLabels[contact.phone_status]}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stato della chiamata */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Stato della Chiamata</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(phoneStatusLabels).map(([status, label]) => (
              <Button
                key={status}
                variant={contact.phone_status === status ? "default" : "outline"}
                size="sm"
                onClick={() => handlePhoneStatusChange(status as PhoneStatus)}
                className="text-sm"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Data callback se da richiamare */}
        {contact.phone_status === "da_richiamare" && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              <Calendar className="w-4 h-4 inline mr-1" />
              Data e Ora di Richiamata
            </label>
            <Input
              type="datetime-local"
              value={callbackDate}
              onChange={(e) => handleCallbackDateChange(e.target.value)}
              className="max-w-xs"
            />
          </div>
        )}

        {/* Esiti se contattato */}
        {contact.phone_status === "contattato" && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground">Esiti della Chiamata</h4>

            {/* Interesse */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Interesse verso la proposta</label>
              <div className="flex gap-2">
                {[
                  { value: "si", label: "Sì", color: "bg-green-100 text-green-800" },
                  { value: "forse", label: "Forse", color: "bg-yellow-100 text-yellow-800" },
                  { value: "no", label: "No", color: "bg-red-100 text-red-800" },
                ].map(({ value, label, color }) => (
                  <Button
                    key={value}
                    variant={contact.interesse === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInterestChange(value as InterestLevel)}
                    className={contact.interesse === value ? "" : "hover:" + color}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reindirizzamento */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Reindirizzato al sito</label>
              <div className="flex gap-2">
                {[
                  { value: "si", label: "Sì", color: "bg-green-100 text-green-800" },
                  { value: "forse", label: "Forse", color: "bg-yellow-100 text-yellow-800" },
                  { value: "no", label: "No", color: "bg-red-100 text-red-800" },
                ].map(({ value, label, color }) => (
                  <Button
                    key={value}
                    variant={contact.reindirizzato === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRedirectChange(value as RedirectStatus)}
                    className={contact.reindirizzato === value ? "" : "hover:" + color}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Note</label>
          <Textarea
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="Aggiungi note o impressioni sulla chiamata..."
            className="min-h-[80px]"
          />
        </div>

        {/* Info callback se programmata */}
        {contact.callbackAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-2 rounded">
            <Clock className="w-4 h-4" />
            <span>Richiamata programmata: {new Date(contact.callbackAt).toLocaleString("it-IT")}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
