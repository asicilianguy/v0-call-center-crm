"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Database, AlertCircle, CheckCircle, Loader2, Trash } from "lucide-react"
import { migrateContactsToMongoDB } from "@/lib/storage"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function MigrateButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [result, setResult] = useState<{ success: boolean; migrated: number; cleared: boolean } | null>(null)
  
  const handleMigration = async () => {
    setIsMigrating(true)
    setResult(null)
    
    try {
      const migrationResult = await migrateContactsToMongoDB()
      setResult(migrationResult)
    } catch (error) {
      console.error("Errore durante la migrazione:", error)
      setResult({ success: false, migrated: 0, cleared: false })
    } finally {
      setIsMigrating(false)
    }
  }
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="flex items-center gap-2 bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
      >
        <Database className="h-4 w-4" />
        Migra Dati a MongoDB
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Migrazione Dati a MongoDB</DialogTitle>
            <DialogDescription>
              Questa operazione copierà tutti i contatti dal localStorage al database MongoDB.
              I contatti esistenti nel database verranno sovrascritti e, al termine della migrazione, 
              il localStorage verrà pulito per ottimizzare le performance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {!isMigrating && !result && (
              <div className="flex flex-col gap-2 items-center justify-center text-center p-4">
                <Database className="h-16 w-16 text-amber-500 mb-2" />
                <p>Premi il pulsante "Migra" per iniziare la migrazione dei dati.</p>
                <p className="text-sm text-muted-foreground">
                  Tutti i contatti presenti nel localStorage verranno copiati nel database
                  e successivamente il localStorage verrà pulito.
                </p>
              </div>
            )}
            
            {isMigrating && (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <Loader2 className="h-16 w-16 text-blue-500 mb-2 animate-spin" />
                <p>Migrazione in corso...</p>
                <p className="text-sm text-muted-foreground">
                  Non chiudere questa finestra fino al completamento dell'operazione.
                </p>
              </div>
            )}
            
            {result && result.success && (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <CheckCircle className="h-16 w-16 text-green-500 mb-2" />
                <p>Migrazione completata con successo!</p>
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Database className="h-4 w-4 text-blue-500" />
                    <span><strong>{result.migrated}</strong> contatti migrati a MongoDB</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Trash className="h-4 w-4 text-red-500" />
                    <span>
                      {result.cleared 
                        ? "localStorage pulito con successo" 
                        : "Pulizia localStorage fallita"}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                  <p className="font-semibold">Informazione</p>
                  <p>Da ora in poi tutti i dati verranno gestiti direttamente dal database MongoDB.</p>
                </div>
              </div>
            )}
            
            {result && !result.success && (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <AlertCircle className="h-16 w-16 text-red-500 mb-2" />
                <p>Migrazione fallita!</p>
                <p className="text-sm text-muted-foreground">
                  Si è verificato un errore durante la migrazione dei dati.
                  Riprova o contatta l'amministratore.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {!isMigrating && !result && (
              <>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Annulla
                </Button>
                <Button onClick={handleMigration}>
                  Migra
                </Button>
              </>
            )}
            
            {(isMigrating || result) && (
              <Button
                variant={result && result.success ? "default" : "outline"}
                onClick={() => {
                  setIsOpen(false);
                  // Se la migrazione è avvenuta con successo, ricarica la pagina
                  // per assicurarsi che i dati vengano caricati dal database
                  if (result && result.success) {
                    window.location.reload();
                  }
                }}
                disabled={isMigrating}
              >
                {result ? "Chiudi" : "Attendere..."}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
