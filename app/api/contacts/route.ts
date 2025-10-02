// app/api/contacts/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Contact } from '@/lib/types';

// CRITICAL: Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // NUOVO: Parametro per richiedere solo le statistiche
    const statsOnly = searchParams.get('statsOnly') === 'true';
    
    const client = await clientPromise;
    const db = client.db("consignment");
    
    // Se viene richiesto solo le statistiche, restituiscile subito
    if (statsOnly) {
      console.log('[CONTACTS] Stats only request at:', new Date().toISOString());
      
      const stats = await db.collection("contacts").aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            non_contattato: { 
              $sum: { $cond: [{ $eq: ["$phone_status", "non_contattato"] }, 1, 0] } 
            },
            non_ha_risposto: { 
              $sum: { $cond: [{ $eq: ["$phone_status", "non_ha_risposto"] }, 1, 0] } 
            },
            da_richiamare: { 
              $sum: { $cond: [{ $eq: ["$phone_status", "da_richiamare"] }, 1, 0] } 
            },
            contattato: { 
              $sum: { $cond: [{ $eq: ["$phone_status", "contattato"] }, 1, 0] } 
            }
          }
        }
      ]).toArray();
      
      const result = stats.length > 0 ? stats[0] : {
        total: 0,
        non_contattato: 0,
        non_ha_risposto: 0,
        da_richiamare: 0,
        contattato: 0
      };
      
      delete result._id;
      
      const response = NextResponse.json({
        ...result,
        _timestamp: new Date().toISOString()
      });
      
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      
      console.log('[CONTACTS] Stats calculated:', result);
      
      return response;
    }
    
    // Altrimenti procedi con la logica normale dei contatti
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortBy = searchParams.get('sortBy') || 'updateStatus';
    const includeStats = searchParams.get('includeStats') === 'true';
    
    const skip = (page - 1) * pageSize;
    const searchQuery = searchParams.get('search')?.trim() || '';
    
    // Costruisci i filtri
    const filters: Record<string, any> = {};
    
    if (searchParams.get('phone_status') && searchParams.get('phone_status') !== 'tutti') {
      filters.phone_status = searchParams.get('phone_status');
    }
    
    if (searchParams.get('interesse') && searchParams.get('interesse') !== 'tutti') {
      filters.interesse = searchParams.get('interesse');
    }
    
    if (searchParams.get('reindirizzato') && searchParams.get('reindirizzato') !== 'tutti') {
      filters.reindirizzato = searchParams.get('reindirizzato');
    }
    
    if (searchParams.get('isPinned') && searchParams.get('isPinned') !== 'tutti') {
      filters.isPinned = searchParams.get('isPinned') === 'true';
    }
    
    if (searchQuery) {
      filters.$or = [
        { azienda: { $regex: searchQuery, $options: 'i' } },
        { telefono: { $regex: searchQuery, $options: 'i' } },
        { indirizzo: { $regex: searchQuery, $options: 'i' } },
        { sito: { $regex: searchQuery, $options: 'i' } },
        { note: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    // Calcola le statistiche se richiesto (in parallelo con i contatti)
    let statsPromise = null;
    if (includeStats) {
      console.log('[CONTACTS] Including stats in response');
      statsPromise = db.collection("contacts").aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            non_contattato: { 
              $sum: { $cond: [{ $eq: ["$phone_status", "non_contattato"] }, 1, 0] } 
            },
            non_ha_risposto: { 
              $sum: { $cond: [{ $eq: ["$phone_status", "non_ha_risposto"] }, 1, 0] } 
            },
            da_richiamare: { 
              $sum: { $cond: [{ $eq: ["$phone_status", "da_richiamare"] }, 1, 0] } 
            },
            contattato: { 
              $sum: { $cond: [{ $eq: ["$phone_status", "contattato"] }, 1, 0] } 
            }
          }
        }
      ]).toArray();
    }
    
    // Ottieni il conteggio totale e i contatti
    const [totalCount, contacts, statsResult] = await Promise.all([
      db.collection("contacts").countDocuments(filters),
      db.collection("contacts")
        .find(filters)
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      statsPromise
    ]);
    
    // Applica l'ordinamento in memoria
    let sortedContacts = [...contacts];
    
    switch (sortBy) {
      case "updateStatus":
        sortedContacts.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
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
        sortedContacts.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        break;
      
      case "updatedOldest":
        sortedContacts.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        });
        break;
      
      case "name":
        sortedContacts.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return a.azienda.localeCompare(b.azienda);
        });
        break;
    }
    
    // Costruisci la risposta
    const responseData: any = {
      contacts: sortedContacts,
      totalCount: totalCount
    };
    
    // Aggiungi le stats se richieste
    if (includeStats && statsResult) {
      const stats = statsResult.length > 0 ? statsResult[0] : {
        total: 0,
        non_contattato: 0,
        non_ha_risposto: 0,
        da_richiamare: 0,
        contattato: 0
      };
      delete stats._id;
      responseData.stats = {
        ...stats,
        _timestamp: new Date().toISOString()
      };
      
      console.log('[CONTACTS] Stats included:', stats);
    }
    
    const response = NextResponse.json(responseData);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    
    return response;
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
    
    if (Array.isArray(body)) {
      const contactsWithDefaults = body.map(contact => ({
        ...contact,
        isPinned: contact.isPinned ?? false
      }));
      const result = await db.collection("contacts").insertMany(contactsWithDefaults);
      
      console.log('[CONTACTS POST] Inserted', result.insertedCount, 'contacts');
      
      return NextResponse.json({ inserted: result.insertedCount });
    } else {
      const contactWithDefaults = {
        ...body,
        isPinned: body.isPinned ?? false
      };
      const result = await db.collection("contacts").insertOne(contactWithDefaults);
      
      console.log('[CONTACTS POST] Inserted single contact:', result.insertedId);
      
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
    
    console.log('[CONTACTS PUT] Updating contact:', id, 'with:', updates);
    
    const client = await clientPromise;
    const db = client.db("consignment");
    
    const result = await db.collection("contacts").updateOne(
      { id: id },
      { $set: { ...updates, updatedAt: new Date().toISOString() } }
    );
    
    console.log('[CONTACTS PUT] Updated:', result.modifiedCount, 'documents');
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }
    
    return NextResponse.json({ updated: result.modifiedCount });
  } catch (error) {
    console.error("Failed to update contact:", error);
    return NextResponse.json({ error: "Failed to update contact", details: String(error) }, { status: 500 });
  }
}
