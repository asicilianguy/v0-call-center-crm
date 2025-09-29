// app/api/contacts/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Contact } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parametri di paginazione
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortBy = searchParams.get('sortBy') || 'updateStatus';
    
    // Calcola lo skip per la paginazione
    const skip = (page - 1) * pageSize;
    
    // Recupera il parametro di ricerca
    const searchQuery = searchParams.get('search')?.trim() || '';
    
    // Costruisci i filtri
    const filters: Record<string, any> = {};
    
    // Aggiungi i filtri dai parametri della query
    if (searchParams.get('phone_status') && searchParams.get('phone_status') !== 'tutti') {
      filters.phone_status = searchParams.get('phone_status');
    }
    
    if (searchParams.get('interesse') && searchParams.get('interesse') !== 'tutti') {
      filters.interesse = searchParams.get('interesse');
    }
    
    if (searchParams.get('reindirizzato') && searchParams.get('reindirizzato') !== 'tutti') {
      filters.reindirizzato = searchParams.get('reindirizzato');
    }
    
    // Aggiungi la ricerca testuale se presente
    if (searchQuery) {
      // Cerca in più campi utilizzando una query $or di MongoDB
      filters.$or = [
        { azienda: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive
        { telefono: { $regex: searchQuery, $options: 'i' } },
        { indirizzo: { $regex: searchQuery, $options: 'i' } },
        { sito: { $regex: searchQuery, $options: 'i' } },
        { note: { $regex: searchQuery, $options: 'i' } } // Aggiungi anche ricerca nelle note
      ];
    }
    
    const client = await clientPromise;
    const db = client.db("consignment");
    
    // Ottieni il conteggio totale per la paginazione con i filtri applicati
    const totalCount = await db.collection("contacts").countDocuments(filters);
    
    // Ottieni i contatti paginati con i filtri applicati
    const contacts = await db.collection("contacts")
      .find(filters)
      .skip(skip)
      .limit(pageSize)
      .toArray();
    
    // Applica l'ordinamento in memoria (si potrebbe ottimizzare usando l'ordinamento di MongoDB)
    let sortedContacts = [...contacts];
    
    switch (sortBy) {
      case "updateStatus":
        sortedContacts.sort((a, b) => {
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
        break;
      
      case "updatedNewest":
        sortedContacts.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      
      case "updatedOldest":
        sortedContacts.sort((a, b) => 
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
        break;
      
      case "name":
        sortedContacts.sort((a, b) => 
          a.azienda.localeCompare(b.azienda)
        );
        break;
    }
    
    // Restituisci sia i contatti paginati che il conteggio totale
    return NextResponse.json({
      contacts: sortedContacts,
      totalCount: totalCount
    });
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    return NextResponse.json({ error: "Failed to fetch contacts", details: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("consignment");
    
    // Handle single contact or array of contacts
    if (Array.isArray(body)) {
      // Batch insert
      const result = await db.collection("contacts").insertMany(body);
      return NextResponse.json({ inserted: result.insertedCount });
    } else {
      // Single contact insert
      const result = await db.collection("contacts").insertOne(body);
      return NextResponse.json({ inserted: result.acknowledged ? 1 : 0, id: result.insertedId });
    }
  } catch (error) {
    console.error("Failed to insert contacts:", error);
    return NextResponse.json({ error: "Failed to insert contacts", details: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    const client = await clientPromise;
    const db = client.db("consignment");
    
    const result = await db.collection("contacts").updateOne(
      { id: id },
      { $set: { ...updates, updatedAt: new Date().toISOString() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }
    
    return NextResponse.json({ updated: result.modifiedCount });
  } catch (error) {
    console.error("Failed to update contact:", error);
    return NextResponse.json({ error: "Failed to update contact", details: String(error) }, { status: 500 });
  }
}
