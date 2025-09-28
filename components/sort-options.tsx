"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownZA, ArrowUpAZ, CalendarClock, Clock } from "lucide-react"

interface SortOptionsProps {
  sortBy: string
  onSortChange: (value: string) => void
}

export function SortOptions({ sortBy, onSortChange }: SortOptionsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Ordina per:</span>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[240px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="updateStatus">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Stato di aggiornamento</span>
            </div>
          </SelectItem>
          <SelectItem value="updatedNewest">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              <span>Aggiornati di recente</span>
            </div>
          </SelectItem>
          <SelectItem value="updatedOldest">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              <span>Aggiornati meno di recente</span>
            </div>
          </SelectItem>
          <SelectItem value="name">
            <div className="flex items-center gap-2">
              <ArrowUpAZ className="h-4 w-4" />
              <span>Nome azienda (A-Z)</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
