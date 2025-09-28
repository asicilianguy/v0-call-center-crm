import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Contact } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'updateStatus';
    
    const client = await clientPromise;
    const db = client.db("consignment");
    const contacts = await db.collection("contacts").find({}).toArray();
    
    // Ordinamento lato server
    let sortedContacts = [...contacts];
    
    switch (sortBy) {
      case "updateStatus":
        // Se updateAt != createdAt, ordina per updatedAt (più recenti prima)
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
    
    return NextResponse.json(sortedContacts);
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
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
    return NextResponse.json({ error: "Failed to insert contacts" }, { status: 500 });
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
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}
