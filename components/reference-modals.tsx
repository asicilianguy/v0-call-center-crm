"use client"

import { useState, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, BookOpen } from "lucide-react"

const TESTO_COINCISO = `👉 Tu:
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
"tramite questa collaborazione potrà usufruire del 20% di sconto base su ogni orologio, che diventerà il suo guadagno diretto. Oltre a un guadagno dovuto all'offerta di servizi aggiuntivi in negozio di cui i clienti nel nostro sito non potranno usufruire (consulenza sul tipo di colore che si abbina di più con gli interni , oppure il montaggio), aumentando quindi il valore percepito potendo così aumentare ulteriormente il costo dell'orologio.
E per i primi 100 orologi venduti riconosciamo anche un ulteriore 30% di sconto extra."

🌐 SITO: antoniorologi.it

📞 DOMANDE POSSIBILI:

❓ "Come fatturate gli ordini?"
💬 "Ogni ordine viene fatturato regolarmente con partita IVA e codice fiscale aziendale. La fattura elettronica viene emessa al momento della spedizione e inviata anche via email per comodità. Non ci sono costi nascosti né spese aggiuntive."

❓ "In quanto tempo riceviamo l'orologio?"
💬 "I tempi standard sono di 7–10 giorni lavorativi dalla conferma dell'ordine, perché ogni orologio viene realizzato e rifinito artigianalmente. Il nostro sistema permette di avere una stima calcolata dinamicamente in base al numero di ordini che abbiamo da fare garantendo così una stima dei tempi più realistica possibile."

❓ "Come spedite i prodotti?"
💬 "Spediamo con UPS, imballaggi rinforzati e sempre con assicurazione inclusa. Al momento della spedizione riceverete il tracking per seguire la consegna in tempo reale. È importante controllare subito le condizioni del prodotto alla consegna e segnalarci eventuali danni entro 2 giorni lavorativi. In questo modo apriamo immediatamente la pratica di assicurazione con il corriere e procediamo con la sostituzione. Il costo delle spedizioni è già compreso nella nostra offerta partner per l'Italia."

❓ "Come possiamo pagare gli ordini?"
💬 "I metodi di pagamento sono mostrati al momento dell'acquisto, si può pagare tramite carta anche a rate con Klarna."

❓ "Esiste la possibilità di fare il reso?"
💬 "Il reso è possibile in caso di evidenti difetti o nel caso in cui arrivi rotto, per tutti gli altri motivi non è possibile richiedere il reso dato che un prodotto personalizzato e quindi realizzato su misura."

🛡️ GESTIONE OBIEZIONI COMUNI:

• "Non ho tempo per gestire un altro fornitore."
💬 "Capisco; proprio per questo il nostro processo è semplice e veloce, senza necessità di magazzino o contratti complessi."

• "Non conosciamo ancora il vostro brand."
💬 "Il nostro focus è costruire relazioni durature: con una chiamata iniziale può familiarizzare con la qualità e la professionalità che offriamo."

• "Temo costi nascosti."
💬 "L'unico costo è il prezzo di listino, da cui vi verrà scontato il 20%. Non ci sono spese aggiuntive né di attivazione."

🎯 CHIUSURA E PROSSIMI PASSI:

1. Richiesta di Impegno:
"Le mando un link con accesso alla piattaforma dove può esplorare il tutto e una guida semplice sulle funzionalità del sito, così se ne fa un'idea diretta. Poi ci risentiamo tra qualche giorno nel caso in cui abbia ulteriori dubbi, va bene per Lei?"

2. Conferma e formazione:
• inviare il manuale d'uso del sito e il link del sito.

3. Ringraziamenti:
"La ringrazio per il suo tempo. Rimango a disposizione per qualsiasi domanda. Buona giornata!"`

const TESTO_ESAUSTIVO = `📋 GUIDA COMPLETA CHIAMATE - ANTONIOROLOGI.IT

🎯 OBIETTIVO PRINCIPALE:
Proporre una collaborazione commerciale per la vendita di orologi da parete in specchio personalizzati, realizzati artigianalmente su misura.

📞 SCRIPT DETTAGLIATO:

1️⃣ APERTURA CHIAMATA:
"Buongiorno [nome negozio], sono Francesca, con chi ho il piacere di parlare? È il/la titolare del negozio?"
(PAUSA - ascolta la risposta e prendi nota del nome)

2️⃣ PRESENTAZIONE INIZIALE:
"Perfetto [nome], la disturbo solo un minuto... ci tengo a dirle che non sono un call center, ma la contatto per proporle una collaborazione pensata proprio per valorizzare la sua attività."

3️⃣ PRESENTAZIONE AZIENDA:
"Nasciamo come vetreria, in attività da oltre vent'anni, ad oggi siamo anche un brand emergente di artigianato italiano che realizza orologi da parete in specchio, interamente su misura.
Non si tratta di semplici orologi, ma di pezzi unici, autentici complementi d'arredo, che possono essere personalizzati dal nostro sito con anteprime realistiche in ogni fase della creazione."

4️⃣ PROPOSTA COMMERCIALE:
"Per lei non ci sono acquisti di magazzino né burocrazie: ogni orologio viene realizzato solo su ordinazione.
In questo modo può distinguersi, offrendo ai suoi clienti un prodotto esclusivo, innovativo e che non troveranno altrove."

5️⃣ VANTAGGI ECONOMICI:
"Tramite questa collaborazione potrà usufruire del 20% di sconto base su ogni orologio, che diventerà il suo guadagno diretto. Oltre a un guadagno dovuto all'offerta di servizi aggiuntivi in negozio di cui i clienti nel nostro sito non potranno usufruire (consulenza sul tipo di colore che si abbina di più con gli interni, oppure il montaggio), aumentando quindi il valore percepito potendo così aumentare ulteriormente il costo dell'orologio.
E per i primi 100 orologi venduti riconosciamo anche un ulteriore 30% di sconto extra."

🌐 SITO WEB: antoniorologi.it

📋 FAQ COMPLETE:

❓ FATTURAZIONE:
"Come fatturate gli ordini?"
💬 RISPOSTA: "Ogni ordine viene fatturato regolarmente con partita IVA e codice fiscale aziendale. La fattura elettronica viene emessa al momento della spedizione e inviata anche via email per comodità. Non ci sono costi nascosti né spese aggiuntive."

❓ TEMPI DI CONSEGNA:
"In quanto tempo riceviamo l'orologio?"
💬 RISPOSTA: "I tempi standard sono di 7–10 giorni lavorativi dalla conferma dell'ordine, perché ogni orologio viene realizzato e rifinito artigianalmente. Il nostro sistema permette di avere una stima calcolata dinamicamente in base al numero di ordini che abbiamo da fare garantendo così una stima dei tempi più realistica possibile."

❓ SPEDIZIONI:
"Come spedite i prodotti?"
💬 RISPOSTA: "Spediamo con UPS, imballaggi rinforzati e sempre con assicurazione inclusa. Al momento della spedizione riceverete il tracking per seguire la consegna in tempo reale. È importante controllare subito le condizioni del prodotto alla consegna e segnalarci eventuali danni entro 2 giorni lavorativi. In questo modo apriamo immediatamente la pratica di assicurazione con il corriere e procediamo con la sostituzione. Il costo delle spedizioni è già compreso nella nostra offerta partner per l'Italia."

❓ PAGAMENTI:
"Come possiamo pagare gli ordini?"
💬 RISPOSTA: "I metodi di pagamento sono mostrati al momento dell'acquisto, si può pagare tramite carta anche a rate con Klarna."

❓ RESI:
"Esiste la possibilità di fare il reso?"
💬 RISPOSTA: "Il reso è possibile in caso di evidenti difetti o nel caso in cui arrivi rotto, per tutti gli altri motivi non è possibile richiedere il reso dato che un prodotto personalizzato e quindi realizzato su misura."

🛡️ GESTIONE OBIEZIONI DETTAGLIATA:

🚫 "Non ho tempo per gestire un altro fornitore."
✅ RISPOSTA: "Capisco perfettamente, [nome]. Proprio per questo il nostro processo è stato pensato per essere semplice e veloce. Non serve magazzino, non ci sono contratti complessi da firmare. Una volta che il cliente ordina dal sito, noi ci occupiamo di tutto: produzione, fatturazione e spedizione diretta. Lei deve solo mostrare il prodotto e incassare la sua percentuale."

🚫 "Non conosciamo ancora il vostro brand."
✅ RISPOSTA: "Ha ragione, [nome], e proprio per questo il nostro focus è costruire relazioni durature basate sulla fiducia. Con una chiamata iniziale può familiarizzare con la qualità e la professionalità che offriamo. Inoltre, può visitare il nostro sito antoniorologi.it per vedere direttamente i nostri prodotti e le recensioni dei clienti."

🚫 "Temo costi nascosti."
✅ RISPOSTA: "La capisco perfettamente, [nome]. Voglio essere trasparente al 100%: l'unico costo è il prezzo di listino, da cui vi verrà scontato il 20% che diventa il vostro guadagno. Non ci sono spese di attivazione, canoni mensili, o costi nascosti di alcun tipo. Tutto è chiaro fin dall'inizio."

🚫 "I miei clienti non sono interessati a questi prodotti."
✅ RISPOSTA: "Capisco la sua preoccupazione, [nome]. Tuttavia, gli orologi da parete personalizzati stanno diventando sempre più richiesti perché permettono di personalizzare gli spazi in modo unico. Molti nostri partner inizialmente avevano la stessa preoccupazione, ma si sono ricreduti vedendo l'interesse dei clienti per prodotti esclusivi e personalizzabili."

🚫 "Il prezzo potrebbe essere troppo alto per i miei clienti."
✅ RISPOSTA: "È una considerazione importante, [nome]. Tuttavia, consideri che si tratta di prodotti artigianali, personalizzati e unici. Il valore percepito è molto alto, e lei può posizionarli come complementi d'arredo di design. Inoltre, con i servizi aggiuntivi che può offrire in negozio, può aumentare ulteriormente il valore e il margine."

🎯 PROCESSO DI CHIUSURA DETTAGLIATO:

1️⃣ CREAZIONE INTERESSE:
"[Nome], le sembra interessante questa opportunità? Ha qualche domanda specifica sui prodotti o sulla collaborazione?"

2️⃣ GESTIONE DUBBI:
(Ascoltare attentamente e rispondere usando le FAQ e la gestione obiezioni)

3️⃣ PROPOSTA CONCRETA:
"Perfetto, [nome]. Le propongo questo: le mando subito il link per accedere alla piattaforma dove può esplorare tutti i nostri prodotti e vedere come funziona il sistema di personalizzazione. Insieme al link le invio anche una guida semplice che spiega tutte le funzionalità."

4️⃣ IMPEGNO RECIPROCO:
"Dopo che avrà avuto modo di dare un'occhiata, ci risentiamo tra 2-3 giorni per chiarire eventuali dubbi e vedere se la collaborazione può essere di suo interesse. Le va bene?"

5️⃣ CONFERMA CONTATTI:
"Perfetto! Confermi che questo è il numero giusto per ricontattarla? E ha un indirizzo email dove posso inviarle il materiale?"

6️⃣ RINGRAZIAMENTI E CHIUSURA:
"Ottimo, [nome]. La ringrazio molto per il tempo che mi ha dedicato. Le invio subito tutto il materiale e ci sentiamo [giorno specifico] per fare il punto. Rimango a disposizione per qualsiasi domanda. Buona giornata!"

📝 NOTE IMPORTANTI:

• Mantenere sempre un tono professionale ma cordiale
• Usare il nome del cliente durante la conversazione
• Ascoltare attivamente e non interrompere
• Prendere appunti durante la chiamata
• Essere preparati a rispondere a domande tecniche
• Non essere insistenti se il cliente non è interessato
• Fissare sempre un follow-up concreto

🎯 OBIETTIVI DELLA CHIAMATA:
✅ Presentare l'azienda e i prodotti
✅ Spiegare i vantaggi della collaborazione
✅ Gestire obiezioni e dubbi
✅ Inviare materiale informativo
✅ Fissare un follow-up

📊 KPI DA MONITORARE:
• Numero di chiamate effettuate
• Tasso di risposta
• Interesse mostrato
• Materiale inviato
• Follow-up programmati
• Conversioni in partnership`

export const ReferenceModals = memo(function ReferenceModals() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("script")

  const openModal = useCallback(() => setIsOpen(true), [])
  const closeModal = useCallback(() => setIsOpen(false), [])

  return (
    <>
      {/* CTA Fissa */}
      <div className="fixed bottom-4 right-4 z-50">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openModal}
              size="lg"
              className="shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold px-6 py-3"
            >
              <FileText className="mr-2 h-5 w-5" />
              Guida Chiamate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[85vh] p-0">
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle className="text-xl font-bold text-gray-800">📞 Guida Completa per le Chiamate</DialogTitle>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="script" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Script Base
                  </TabsTrigger>
                  <TabsTrigger value="completa" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Guida Completa
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="script" className="mt-0 flex-1">
                <ScrollArea className="h-[65vh] px-6 pb-6">
                  <div className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{TESTO_COINCISO}</div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="completa" className="mt-0 flex-1">
                <ScrollArea className="h-[65vh] px-6 pb-6">
                  <div className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{TESTO_ESAUSTIVO}</div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
})
