"use client"

import { useState, useEffect, useRef } from "react"
import type { Contact, FilterState } from "@/lib/types"
import { loadContacts, saveContacts, updateContact, loadContactsFromCSV } from "@/lib/storage"
import { ContactCard } from "@/components/contact-card"
import { Filters } from "@/components/filters"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Users, Clock, CheckCircle, AlertCircle, BookOpen, ArrowLeft } from "lucide-react"

export default function CRMPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showGuide, setShowGuide] = useState(false)
  const [activeTab, setActiveTab] = useState<"script" | "guida">("script")
  const [savedScrollPosition, setSavedScrollPosition] = useState(0)
  const crmContainerRef = useRef<HTMLDivElement>(null)
  const [filters, setFilters] = useState<FilterState>({
    phone_status: "tutti",
    interesse: "tutti",
    reindirizzato: "tutti",
  })

  useEffect(() => {
    async function initializeContacts() {
      setLoading(true)

      let storedContacts = loadContacts()

      if (storedContacts.length === 0) {
        console.log("Caricamento contatti dal CSV...")
        storedContacts = await loadContactsFromCSV()
        if (storedContacts.length > 0) {
          saveContacts(storedContacts)
          console.log(`Caricati ${storedContacts.length} contatti dal CSV`)
        }
      }

      setContacts(storedContacts)
      setLoading(false)
    }

    initializeContacts()
  }, [])

  useEffect(() => {
    let filtered = contacts

    if (filters.phone_status !== "tutti") {
      filtered = filtered.filter((c) => c.phone_status === filters.phone_status)
    }

    if (filters.interesse !== "tutti") {
      filtered = filtered.filter((c) => c.interesse === filters.interesse)
    }

    if (filters.reindirizzato !== "tutti") {
      filtered = filtered.filter((c) => c.reindirizzato === filters.reindirizzato)
    }

    setFilteredContacts(filtered)
  }, [contacts, filters])

  const handleContactUpdate = (contactId: string, updates: Partial<Contact>) => {
    const updatedContacts = updateContact(contactId, updates)
    setContacts(updatedContacts)
  }

  const handleReloadData = async () => {
    setLoading(true)
    const freshContacts = await loadContactsFromCSV()
    if (freshContacts.length > 0) {
      saveContacts(freshContacts)
      setContacts(freshContacts)
    }
    setLoading(false)
  }

  const handleOpenGuide = () => {
    if (crmContainerRef.current) {
      setSavedScrollPosition(window.scrollY)
    }
    setShowGuide(true)
  }

  const handleCloseGuide = () => {
    setShowGuide(false)
    setTimeout(() => {
      window.scrollTo(0, savedScrollPosition)
    }, 0)
  }

  const scriptContent = `Tu: 
"Buongiorno [nome negozio], sono Francesca, con chi ho il piacere di parlare? è il/la titolare del negozio? 
(pausa, ascolta la risposta) 

Tu: 
"Perfetto, la disturbo solo un minuto... ci tengo a dirle che non sono un call center, ma la contatto per proporle una collaborazione pensata proprio per valorizzare la sua attività." 

Tu: 
"Nasciamo come vetreria, in attività da oltre vent'anni, ad oggi siamo anche un brand emergente di artigianato italiano che realizza orologi da parete in specchio, interamente su misura. 
Non si tratta di semplici orologi, ma di pezzi unici, autentici complementi d'arredo, che possono essere personalizzati dal nostro sito con anteprime realistiche in ogni fase della creazione." 

Tu: 
"Per lei non ci sono acquisti di magazzino né burocrazie: ogni orologio viene realizzato solo su ordinazione. 
In questo modo può distinguersi, offrendo ai suoi clienti un prodotto esclusivo, innovativo e che non troveranno altrove." 

Tu: 
"tramite questa collaborazione potrà usufruire del 20% di sconto base su ogni orologio, che diventerà il suo guadagno diretto. Oltre a un guadagno dovuto all'offerta di servizi aggiuntivi in negozio di cui i clienti nel nostro sito non potranno usufruire (consulenza sul tipo di colore che si abbina di più con gli interni , oppure il montaggio), aumentando quindi il valore percepito potendo così aumentare ulteriormente il costo dell'orologio. 
E per i primi 100 orologi venduti riconosciamo anche un ulteriore 30% di sconto extra." 

SITO: antoniorologi.it 

DOMANDE POSSIBILI: 
"Domanda: "Come fatturate gli ordini?" 
Risposta: 

"Ogni ordine viene fatturato regolarmente con partita IVA e codice fiscale aziendale. La fattura elettronica viene emessa al momento della spedizione e inviata anche via email per comodità. Non ci sono costi nascosti né spese aggiuntive." 

Domanda: "In quanto tempo riceviamo l'orologio?" 
Risposta: 

"I tempi standard sono di 7–10 giorni lavorativi dalla conferma dell'ordine, perché ogni orologio viene realizzato e rifinito artigianalmente. Il nostro sistema permette di avere una stima calcolata dinamicamente in base al numero di ordini che abbiamo da fare garantendo così una stima dei tempi più realistica possibile. 

Domanda: "Come spedite i prodotti?" 
Risposta: 

"Spediamo con UPS, imballaggi rinforzati e sempre con assicurazione inclusa. Al momento della spedizione riceverete il tracking per seguire la consegna in tempo reale.è importante controllare subito le condizioni del prodotto alla consegna e segnalarci eventuali danni entro 2 giorni lavorativi. In questo modo apriamo immediatamente la pratica di assicurazione con il corriere e procediamo con la sostituzione. 
Il costo delle spedizioni è già compreso nella nostra offerta partner per l'italia. 

Domanda: "Come possiamo pagare gli ordini?" 
Risposta: 

"I metodi di pagamento sono mostrati al momento dell'acquisto, si puó pagare tramite carta anche a rate con klarna. 

Domanda: Esiste la possibilità di fare il reso? 

Risposta: il reso é possibile in caso di evidenti difetti o nel caso in cui arrivi rotto ,per tutti gli altri motivi non è possibile richiedere il reso dato che un prodotto personalizzato e quindi realizzato su misura." 

Gestione delle Obiezioni Comuni 
• "Non ho tempo per gestire un altro fornitore." 
Risposta: "Capisco; proprio per questo il nostro processo è semplice e veloce, senza necessità di magazzino o contratti complessi." 
• "Non conosciamo ancora il vostro brand." 
Risposta: "Il nostro focus è costruire relazioni durature: con una chiamata iniziale può familiarizzare con la qualità e la professionalità che offriamo." 
• "Temo costi nascosti." 
Risposta: "L'unico costo è il prezzo di listino, da cui vi verrà scontato il 20%. Non ci sono spese aggiuntive né di attivazione." 

Chiusura e Prossimi Passi 
1. Richiesta di Impegno: 
• "Le mando un link con accesso alla piattaforma dove può esplorare il tutto e una guida semplice sulle funzionalità del sito, così se ne fa un'idea diretta. Poi ci risentiamo tra qualche giorno nel caso in cui abbia ulteriori dubbi, va bene per Lei?" 
2. Conferma e formazione: 
• inviare il manuale d'uso del sito e il link del sito. 
3. Ringraziamenti: 
• "La ringrazio per il suo tempo. Rimango a disposizione per qualsiasi domanda. Buona giornata!"`

  const guidaContent = `GUIDA COMPLETA OPERATORE CALL CENTER

📞 PREPARAZIONE ALLA CHIAMATA
- Verifica nome azienda e numero di telefono
- Prepara il tono di voce professionale ma amichevole
- Tieni a portata di mano tutte le informazioni sul prodotto

🎯 OBIETTIVO DELLA CHIAMATA
Proporre una collaborazione commerciale per la vendita di orologi da parete in specchio personalizzati, realizzati artigianalmente in Italia.

💼 INFORMAZIONI AZIENDA
- Vetreria attiva da oltre 20 anni
- Brand emergente di artigianato italiano
- Specializzati in orologi da parete in specchio su misura
- Sito web: antoniorologi.it

🔥 PUNTI DI FORZA DEL PRODOTTO
- Pezzi unici, non reperibili altrove
- Personalizzazione completa con anteprime realistiche
- Realizzazione solo su ordinazione (no magazzino)
- Complementi d'arredo di alta qualità

💰 PROPOSTA COMMERCIALE
- 20% di sconto base su ogni orologio (= guadagno diretto partner)
- Servizi aggiuntivi in negozio per aumentare il valore
- 30% di sconto extra sui primi 100 orologi venduti
- Nessun costo di attivazione o spese nascoste

⚡ VANTAGGI PER IL PARTNER
- Nessun acquisto di magazzino
- Nessuna burocrazia complessa
- Prodotto esclusivo per distinguersi
- Guadagno immediato su ogni vendita
- Possibilità di offrire servizi aggiuntivi (consulenza colori, montaggio)

📋 PROCESSO OPERATIVO
1. Partner riceve ordine dal cliente
2. Ordine viene trasmesso a noi
3. Realizziamo l'orologio in 7-10 giorni lavorativi
4. Spediamo con UPS, imballaggio rinforzato e assicurazione
5. Fatturazione regolare con P.IVA

🛡️ GARANZIE E SICUREZZA
- Fatturazione elettronica regolare
- Spedizione assicurata inclusa nel prezzo
- Tracking in tempo reale
- Reso possibile solo per difetti o danni durante trasporto
- Controllo qualità su ogni pezzo

📞 GESTIONE OBIEZIONI COMUNI
"Non ho tempo per un altro fornitore"
→ "Il nostro processo è semplice e veloce, senza magazzino o contratti complessi"

"Non conosciamo il vostro brand"
→ "Il nostro focus è costruire relazioni durature, può familiarizzare con una chiamata iniziale"

"Temo costi nascosti"
→ "L'unico costo è il prezzo di listino meno il 20%. Nessuna spesa aggiuntiva"

✅ CHIUSURA EFFICACE
1. Inviare link piattaforma e guida funzionalità
2. Programmare ricontatto tra qualche giorno
3. Ringraziare per il tempo dedicato
4. Rimanere disponibili per domande

🎯 METRICHE DI SUCCESSO
- Interesse mostrato durante la chiamata
- Richiesta di maggiori informazioni
- Accettazione invio materiali
- Programmazione secondo contatto`

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento contatti...</p>
        </div>
      </div>
    )
  }

  if (showGuide) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-screen overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={handleCloseGuide}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                Torna al CRM
              </Button>
              <h1 className="text-3xl font-bold text-foreground">Guida Operatore</h1>
            </div>

            <div className="flex gap-2 mb-6">
              <Button
                onClick={() => setActiveTab("script")}
                variant={activeTab === "script" ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Script Base
              </Button>
              <Button
                onClick={() => setActiveTab("guida")}
                variant={activeTab === "guida" ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Guida Completa
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {activeTab === "script" ? scriptContent : guidaContent}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={crmContainerRef} className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">CRM Telefonico</h1>
          <p className="text-muted-foreground">Gestione contatti per operatori call center</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Contatti</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Non Contattati</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {contacts.filter((c) => c.phone_status === "non_contattato").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Da Richiamare Oggi</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {
                  contacts.filter((c) => {
                    if (!c.callbackAt) return false
                    const callbackDate = new Date(c.callbackAt)
                    const today = new Date()
                    return callbackDate.toDateString() === today.toDateString()
                  }).length
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contattati</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {contacts.filter((c) => c.phone_status === "contattato").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Filters
          filters={filters}
          onFiltersChange={setFilters}
          contactCounts={{
            total: contacts.length,
            non_contattato: contacts.filter((c) => c.phone_status === "non_contattato").length,
            non_ha_risposto: contacts.filter((c) => c.phone_status === "non_ha_risposto").length,
            da_richiamare: contacts.filter((c) => c.phone_status === "da_richiamare").length,
            contattato: contacts.filter((c) => c.phone_status === "contattato").length,
          }}
        />

        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-muted-foreground">
            Visualizzando {filteredContacts.length} di {contacts.length} contatti
          </div>
          <Button onClick={handleReloadData} variant="outline">
            Ricarica Dati
          </Button>
        </div>

        {filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nessun contatto trovato</h3>
              <p className="text-muted-foreground text-center">
                {contacts.length === 0
                  ? "Non ci sono contatti caricati. Verifica il file CSV."
                  : "Nessun contatto corrisponde ai filtri selezionati."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredContacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} onUpdate={handleContactUpdate} />
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6">
        <Button
          onClick={handleOpenGuide}
          size="lg"
          className="shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700 text-white"
        >
          <BookOpen className="h-5 w-5 mr-2" />
          Guida Operatore
        </Button>
      </div>
    </div>
  )
}
