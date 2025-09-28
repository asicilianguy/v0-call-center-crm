// app/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import type { Contact, FilterState } from "@/lib/types"
import { ContactCard } from "@/components/contact-card"
import { Filters } from "@/components/filters"
import { SortOptions } from "@/components/sort-options"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Phone, Users, Clock, CheckCircle, AlertCircle, BookOpen, ArrowLeft, ArrowUpDown } from "lucide-react"

// Importo il componente per la paginazione
const Pagination = ({ currentPage, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }) => {
  const pageSizeOptions = [10, 15, 20, 30, 50]

  // Funzione per generare l'array degli elementi da mostrare nella paginazione
  const getPageNumbers = () => {
    const delta = 1 // Quante pagine mostrare prima e dopo la pagina corrente
    const pages = []

    // Calcola l'intervallo di pagine da mostrare
    let lowerBound = Math.max(1, currentPage - delta)
    let upperBound = Math.min(totalPages, currentPage + delta)

    // Assicurati di mostrare sempre almeno 2*delta+1 pagine se disponibili
    if (upperBound - lowerBound < 2 * delta) {
      if (currentPage < totalPages / 2) {
        upperBound = Math.min(totalPages, lowerBound + 2 * delta)
      } else {
        lowerBound = Math.max(1, upperBound - 2 * delta)
      }
    }

    // Aggiungi prima pagina se necessario
    if (lowerBound > 1) {
      pages.push(1)
      if (lowerBound > 2) {
        pages.push("...")
      }
    }

    // Aggiungi le pagine nell'intervallo
    for (let i = lowerBound; i <= upperBound; i++) {
      pages.push(i)
    }

    // Aggiungi ultima pagina se necessario
    if (upperBound < totalPages) {
      if (upperBound < totalPages - 1) {
        pages.push("...")
      }
      pages.push(totalPages)
    }

    return pages
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
      <div className="text-sm text-muted-foreground">
        Visualizzati {startItem} - {endItem} di {totalItems} contatti
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center mr-2">
          <span className="text-sm mr-2">Elementi per pagina:</span>
          <select
            className="border rounded p-1 text-sm"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <Button variant="outline" size="icon" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
          <span className="sr-only">Prima pagina</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevrons-left"
          >
            <path d="m11 17-5-5 5-5" />
            <path d="m18 17-5-5 5-5" />
          </svg>
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <span className="sr-only">Pagina precedente</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-left"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Button>

        <div className="flex items-center">
          {getPageNumbers().map((page, i) =>
            typeof page === "number" ? (
              <Button
                key={i}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="mx-1 w-8"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ) : (
              <span key={i} className="mx-1">
                ...
              </span>
            ),
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span className="sr-only">Pagina successiva</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-right"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <span className="sr-only">Ultima pagina</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevrons-right"
          >
            <path d="m6 17 5-5-5-5" />
            <path d="m13 17 5-5-5-5" />
          </svg>
        </Button>
      </div>
    </div>
  )
}

// Componente principale della pagina
export default function CRMPage() {
  // Stati per i contatti e UI
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showGuide, setShowGuide] = useState(false)
  const [activeTab, setActiveTab] = useState<"script" | "guida">("script")
  const [savedScrollPosition, setSavedScrollPosition] = useState(0)
  const [sortBy, setSortBy] = useState<string>("updateStatus")
  const crmContainerRef = useRef<HTMLDivElement>(null)

  // Stati per filtri
  const [filters, setFilters] = useState<FilterState>({
    phone_status: "tutti",
    interesse: "tutti",
    reindirizzato: "tutti",
  })

  // Stati per paginazione
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalItems, setTotalItems] = useState(0)

  // Conteggi per dashboard
  const [contactCounts, setContactCounts] = useState({
    total: 0,
    non_contattato: 0,
    non_ha_risposto: 0,
    da_richiamare: 0,
    contattato: 0,
  })

  // Carica i contatti dal database
  useEffect(() => {
    async function fetchContacts() {
      setLoading(true)

      try {
        // Prepara i parametri per i filtri
        const filterParams: Record<string, string> = {}
        if (filters.phone_status !== "tutti") filterParams.phone_status = filters.phone_status
        if (filters.interesse !== "tutti") filterParams.interesse = filters.interesse
        if (filters.reindirizzato !== "tutti") filterParams.reindirizzato = filters.reindirizzato

        // Chiamata API per caricare i contatti paginati e filtrati
        const response = await fetch(
          `/api/contacts?page=${currentPage}&pageSize=${pageSize}&sortBy=${sortBy}` +
            Object.entries(filterParams)
              .map(([key, value]) => `&${key}=${value}`)
              .join(""),
        )

        if (!response.ok) {
          throw new Error("Errore nel recupero dei contatti")
        }

        const data = await response.json()
        setContacts(data.contacts || [])
        setTotalItems(data.totalCount || 0)

        // Se non ci sono risultati ma ci sono contatti totali, torna alla prima pagina
        if (data.contacts.length === 0 && data.totalCount > 0 && currentPage > 1) {
          setCurrentPage(1)
        }
      } catch (error) {
        console.error("Errore nel caricamento dei contatti:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
    // Carica anche le statistiche
    fetchContactStats()
  }, [currentPage, pageSize, sortBy, filters])

  // Funzione per caricare le statistiche
  const fetchContactStats = async () => {
    try {
      const response = await fetch("/api/contacts/stats")
      if (response.ok) {
        const stats = await response.json()
        setContactCounts({
          total: stats.total || 0,
          non_contattato: stats.non_contattato || 0,
          non_ha_risposto: stats.non_ha_risposto || 0,
          da_richiamare: stats.da_richiamare || 0,
          contattato: stats.contattato || 0,
        })
      }
    } catch (error) {
      console.error("Errore nel recupero delle statistiche:", error)
    }
  }

  // Handler per l'aggiornamento di un contatto
  const handleContactUpdate = async (contactId: string, updates: Partial<Contact>) => {
    try {
      const response = await fetch("/api/contacts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: contactId,
          ...updates,
        }),
      })

      if (!response.ok) {
        throw new Error("Errore nell'aggiornamento del contatto")
      }

      // Aggiorna il contatto nella lista locale
      setContacts((currentContacts) =>
        currentContacts.map((contact) =>
          contact.id === contactId ? { ...contact, ...updates, updatedAt: new Date().toISOString() } : contact,
        ),
      )

      // Ricarica le statistiche
      fetchContactStats()
    } catch (error) {
      console.error("Errore nell'aggiornamento del contatto:", error)
    }
  }

  // Handler per il cambio pagina
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll all'inizio della lista
    if (crmContainerRef.current) {
      crmContainerRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Handler per il cambio della dimensione della pagina
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Torna alla prima pagina quando cambia la dimensione
  }

  // Calcolo il numero totale di pagine
  const totalPages = Math.ceil(totalItems / pageSize)

  // Handler per il cambio dei filtri
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset alla prima pagina quando cambiano i filtri
  }

  // Handler per il cambio dell'ordinamento
  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1) // Reset alla prima pagina quando cambia l'ordinamento
  }

  // Handler per mostrare/nascondere la guida
  const handleShowGuide = () => {
    if (!showGuide) {
      // Salva la posizione di scroll prima di mostrare la guida
      if (crmContainerRef.current) {
        setSavedScrollPosition(crmContainerRef.current.scrollTop)
      }
    }
    setShowGuide(!showGuide)
  }

  // Handler per tornare dal pannello guida
  const handleHideGuide = () => {
    setShowGuide(false)
    // Ripristina la posizione di scroll quando si chiude la guida
    if (crmContainerRef.current) {
      crmContainerRef.current.scrollTo({ top: savedScrollPosition })
    }
  }

  // Inizializza il database con i dati CSV
  const handleInitializeDatabase = async () => {
    try {
      setLoading(true)

      // Chiamata per inizializzare il database
      const response = await fetch("/api/contacts/initialize", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Errore nell'inizializzazione del database")
      }

      const result = await response.json()

      if (result.success) {
        // Ricarica i contatti e le statistiche
        await fetchContactStats()
        setCurrentPage(1)
      } else {
        console.error("Inizializzazione fallita:", result.message)
      }
    } catch (error) {
      console.error("Errore nell'inizializzazione:", error)
    } finally {
      setLoading(false)
    }
  }

  // Contenuto dello script di chiamata
  const TESTO_SCRIPT = `👉 Tu:
"Buongiorno [nome negozio], sono Francesca, con chi ho il piacere di parlare? è il/la titolare del negozio?
(pausa, ascolta la risposta)

👉 Tu:
"Perfetto, la disturbo solo un minuto… ci tengo a dirle che non sono un call center, ma la contatto per proporle una collaborazione pensata proprio per valorizzare la sua attività."

👉 Tu:
"Nasciamo come vetreria, in attività da oltre vent'anni, ad oggi siamo anche un brand emergente di artigianato italiano che realizza orologi da parete in specchio, interamente su misura.
Non si tratta di semplici orologi, ma di pezzi unici, autentici complementi d'arredo, che possono essere personalizzati dal nostro sito con anteprime realistiche in ogni fase della creazione."

👉 Tu:
"Per lei non ci sono acquisti di magazzino né burocrazie: ogni orologio viene realizzato solo su ordinazione.
In questo modo può distinguersi, offrendo ai suoi clienti un prodotto esclusivo, innovativo e che non troveranno altrove."

👉 Tu:
"tramite questa collaborazione potrà usufruire del 20% di sconto base su ogni orologio, che diventerà il suo guadagno diretto. Oltre a un guadagno dovuto all'offerta di servizi aggiuntivi in negozio di cui i clienti nel nostro sito non potranno usufruire (consulenza sul tipo di colore che si abbina di più con gli interni, oppure il montaggio), aumentando quindi il valore percepito potendo così aumentare ulteriormente il costo dell'orologio.
E per i primi 100 orologi venduti riconosciamo anche un ulteriore 30% di sconto extra."`

  // Contenuto della guida
  const TESTO_GUIDA = `# Informazioni principali
- Sito web: antoniorologi.it
- Prodotti: orologi da parete in specchio personalizzati
- Proposta: collaborazione con negozi per vendita dei prodotti
- Vantaggi: prodotto esclusivo, nessun magazzino, guadagno diretto (20% sconto + servizi)
- Promo: 30% di sconto extra per i primi 100 orologi venduti

# Domande frequenti
## "Come fatturate gli ordini?"
Ogni ordine viene fatturato regolarmente con partita IVA e codice fiscale aziendale. La fattura elettronica viene emessa al momento della spedizione e inviata anche via email per comodità. Non ci sono costi nascosti né spese aggiuntive.

## "In quanto tempo riceviamo l'orologio?"
I tempi standard sono di 7–10 giorni lavorativi dalla conferma dell'ordine, perché ogni orologio viene realizzato e rifinito artigianalmente. Il nostro sistema permette di avere una stima calcolata dinamicamente in base al numero di ordini che abbiamo da fare garantendo così una stima dei tempi più realistica possibile.

## "Come spedite i prodotti?"
Spediamo con UPS, imballaggi rinforzati e sempre con assicurazione inclusa. Al momento della spedizione riceverete il tracking per seguire la consegna in tempo reale. È importante controllare subito le condizioni del prodotto alla consegna e segnalarci eventuali danni entro 2 giorni lavorativi.`

  return (
    <main className="container mx-auto py-4 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <h1 className="text-2xl font-bold mb-2 lg:mb-0">CRM Gestione Chiamate</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleInitializeDatabase}
            variant="outline"
            className="flex items-center gap-2 bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
            disabled={loading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-database"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
            </svg>
            Inizializza Database
          </Button>
          <Button onClick={handleShowGuide} variant="secondary">
            {!showGuide ? (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Consulta Script e Guide
              </>
            ) : (
              <>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Torna al CRM
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistiche Chiamate */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Totale Contatti</p>
              <p className="text-2xl font-bold">{contactCounts.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Da Contattare</p>
              <p className="text-2xl font-bold">{contactCounts.non_contattato}</p>
            </div>
            <Phone className="h-8 w-8 text-gray-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Da Richiamare</p>
              <p className="text-2xl font-bold">{contactCounts.da_richiamare}</p>
            </div>
            <Clock className="h-8 w-8 text-amber-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Contattati</p>
              <p className="text-2xl font-bold">{contactCounts.contattato}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
      </div>

      {/* Contenuto principale */}
      {!showGuide ? (
        <div className="flex flex-col">
          {/* Filtri e Ordinamento */}
          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
            <Filters filters={filters} onFiltersChange={handleFiltersChange} contactCounts={contactCounts} />
            <SortOptions sortBy={sortBy} onSortChange={handleSortChange} />
          </div>

          {/* Lista Contatti */}
          <div className="overflow-y-auto max-h-[calc(100vh-380px)]" ref={crmContainerRef}>
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="text-center">
                  <ArrowUpDown className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-muted-foreground">Caricamento contatti...</p>
                </div>
              </div>
            ) : contacts.length > 0 ? (
              <>
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} onUpdate={handleContactUpdate} />
                  ))}
                </div>

                {/* Componente Paginazione */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </>
            ) : (
              <div className="flex justify-center items-center p-12 border rounded-lg">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto text-amber-500 mb-4" />
                  <p className="font-medium mb-1">Nessun contatto trovato</p>
                  <p className="text-sm text-muted-foreground">
                    {contactCounts.total === 0
                      ? "Il database è vuoto. Utilizza il pulsante 'Inizializza Database' in alto."
                      : "Prova a modificare i filtri per visualizzare altri contatti."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Contenuto della guida */
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              <div className="flex justify-between items-center">
                <span>Guide e Script di Chiamata</span>
                <Button variant="ghost" size="sm" onClick={handleHideGuide}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Torna al CRM
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "script" | "guida")}>
              <TabsList className="mb-4">
                <TabsTrigger value="script">Script di Chiamata</TabsTrigger>
                <TabsTrigger value="guida">Guida e FAQ</TabsTrigger>
              </TabsList>
              <TabsContent value="script" className="mt-4">
                <ScrollArea className="h-[calc(100vh-320px)] pr-4">
                  <div className="whitespace-pre-line font-medium">{TESTO_SCRIPT}</div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="guida" className="mt-4">
                <ScrollArea className="h-[calc(100vh-320px)] pr-4">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-line">{TESTO_GUIDA}</div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
