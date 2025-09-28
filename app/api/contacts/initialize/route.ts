// app/api/contacts/initialize/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Contact } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contacts = body.contacts as Contact[];
    
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { error: "No contacts provided or invalid format" },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db("consignment");
    
    // Verifica se la collezione è vuota prima di inizializzare
    const existingCount = await db.collection("contacts").countDocuments({});
    
    if (existingCount > 0) {
      // La collezione non è vuota, non sovrascriviamo i dati esistenti
      return NextResponse.json({
        success: false,
        message: "Database already initialized",
        existingCount
      });
    }
    
    // Inserisci tutti i contatti
    const result = await db.collection("contacts").insertMany(contacts);
    
    // Verifica che i dati siano stati effettivamente inseriti
    const insertedCount = await db.collection("contacts").countDocuments({});
    const allInserted = insertedCount === contacts.length;
    
    if (!allInserted) {
      console.error(`Inizializzazione fallita: inseriti ${insertedCount}/${contacts.length} contatti`);
      
      return NextResponse.json({ 
        inserted: result.insertedCount,
        success: false,
        message: "Inizializzazione parziale: i dati inseriti non corrispondono ai dati di origine"
      });
    }
    
    return NextResponse.json({ 
      inserted: result.insertedCount,
      success: true 
    });
  } catch (error) {
    console.error("Initialization failed:", error);
    return NextResponse.json(
      { error: "Failed to initialize contacts", details: String(error) },
      { status: 500 }
    );
  }
}
