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
    
    // Drop existing contacts to avoid duplicates (optional)
    await db.collection("contacts").deleteMany({});
    
    // Insert all contacts
    const result = await db.collection("contacts").insertMany(contacts);
    
    // Verifica che i dati siano stati effettivamente inseriti
    const insertedCount = await db.collection("contacts").countDocuments();
    const allInserted = insertedCount === contacts.length;
    
    if (!allInserted) {
      console.error(`Verifica migrazione fallita: inseriti ${insertedCount}/${contacts.length} contatti`);
      
      return NextResponse.json({ 
        migrated: result.insertedCount,
        success: false,
        message: "Migrazione parziale: i dati inseriti non corrispondono ai dati di origine"
      });
    }
    
    return NextResponse.json({ 
      migrated: result.insertedCount,
      success: true 
    });
  } catch (error) {
    console.error("Migration failed:", error);
    return NextResponse.json(
      { error: "Failed to migrate contacts", details: String(error) },
      { status: 500 }
    );
  }
}
