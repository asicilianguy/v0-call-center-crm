// components/pagination.tsx
"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  pageSize,
  totalItems,
  onPageChange, 
  onPageSizeChange 
}: PaginationProps) {
  const pageSizeOptions = [10, 15, 20, 30, 50];
  
  // Funzione per generare l'array degli elementi da mostrare nella paginazione
  const getPageNumbers = () => {
    const delta = 1; // Quante pagine mostrare prima e dopo la pagina corrente
    const pages = [];
    
    // Calcola l'intervallo di pagine da mostrare
    let lowerBound = Math.max(1, currentPage - delta);
    let upperBound = Math.min(totalPages, currentPage + delta);
    
    // Assicurati di mostrare sempre almeno 2*delta+1 pagine se disponibili
    if (upperBound - lowerBound < 2 * delta) {
      if (currentPage < (totalPages / 2)) {
        upperBound = Math.min(totalPages, lowerBound + 2 * delta);
      } else {
        lowerBound = Math.max(1, upperBound - 2 * delta);
      }
    }
    
    // Aggiungi prima pagina se necessario
    if (lowerBound > 1) {
      pages.push(1);
      if (lowerBound > 2) {
        pages.push('...');
      }
    }
    
    // Aggiungi le pagine nell'intervallo
    for (let i = lowerBound; i <= upperBound; i++) {
      pages.push(i);
    }
    
    // Aggiungi ultima pagina se necessario
    if (upperBound < totalPages) {
      if (upperBound < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
      <div className="text-sm text-muted-foreground">
        Visualizzati {startItem} - {endItem} di {totalItems} contatti
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex items-center mr-2">
          <span className="text-sm mr-2">Elementi per pagina:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center">
          {getPageNumbers().map((page, i) => (
            typeof page === 'number' ? (
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
              <span key={i} className="mx-1">...</span>
            )
          ))}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
