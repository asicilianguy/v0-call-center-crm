"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { FilterState, PhoneStatus, InterestLevel, RedirectStatus } from "@/lib/types"

interface FiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  contactCounts: {
    total: number
    non_contattato: number
    non_ha_risposto: number
    da_richiamare: number
    contattato: number
  }
}

const phoneStatusLabels: Record<PhoneStatus | "tutti", string> = {
  tutti: "Tutti gli Stati",
  non_contattato: "Non Contattato",
  non_ha_risposto: "Non Ha Risposto",
  da_richiamare: "Da Richiamare",
  contattato: "Contattato",
}

const interestLabels: Record<InterestLevel | "tutti", string> = {
  tutti: "Tutti i Livelli",
  si: "Interessato",
  forse: "Forse Interessato",
  no: "Non Interessato",
}

const redirectLabels: Record<RedirectStatus | "tutti", string> = {
  tutti: "Tutti gli Stati",
  si: "Reindirizzato",
  forse: "Forse Reindirizzato",
  no: "Non Reindirizzato",
}

export function Filters({ filters, onFiltersChange, contactCounts }: FiltersProps) {
  return (
    <div className="bg-card p-4 rounded-lg border mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="min-w-[200px]">
            <label className="text-sm font-medium text-foreground mb-2 block">Stato Chiamata</label>
            <Select
              value={filters.phone_status}
              onValueChange={(value) => onFiltersChange({ ...filters, phone_status: value as PhoneStatus | "tutti" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti gli Stati</SelectItem>
                <SelectItem value="non_contattato">Non Contattato</SelectItem>
                <SelectItem value="non_ha_risposto">Non Ha Risposto</SelectItem>
                <SelectItem value="da_richiamare">Da Richiamare</SelectItem>
                <SelectItem value="contattato">Contattato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[200px]">
            <label className="text-sm font-medium text-foreground mb-2 block">Interesse</label>
            <Select
              value={filters.interesse || "tutti"}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  interesse: value === "tutti" ? "tutti" : (value as InterestLevel),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti i Livelli</SelectItem>
                <SelectItem value="si">Interessato</SelectItem>
                <SelectItem value="forse">Forse Interessato</SelectItem>
                <SelectItem value="no">Non Interessato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[200px]">
            <label className="text-sm font-medium text-foreground mb-2 block">Reindirizzamento</label>
            <Select
              value={filters.reindirizzato || "tutti"}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  reindirizzato: value === "tutti" ? "tutti" : (value as RedirectStatus),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti gli Stati</SelectItem>
                <SelectItem value="si">Reindirizzato</SelectItem>
                <SelectItem value="forse">Forse Reindirizzato</SelectItem>
                <SelectItem value="no">Non Reindirizzato</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-sm">
            Totale: {contactCounts.total}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            Non Contattati: {contactCounts.non_contattato}
          </Badge>
          <Badge variant="secondary" className="text-sm bg-blue-100 text-blue-800">
            Da Richiamare: {contactCounts.da_richiamare}
          </Badge>
          <Badge variant="secondary" className="text-sm bg-green-100 text-green-800">
            Contattati: {contactCounts.contattato}
          </Badge>
        </div>
      </div>
    </div>
  )
}
