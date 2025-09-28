// app/api/contacts/stats/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("consignment");
    
    // Ottieni il conteggio totale
    const total = await db.collection("contacts").countDocuments({});
    
    // Ottieni i conteggi per ogni stato di chiamata
    const non_contattato = await db.collection("contacts").countDocuments({ phone_status: "non_contattato" });
    const non_ha_risposto = await db.collection("contacts").countDocuments({ phone_status: "non_ha_risposto" });
    const da_richiamare = await db.collection("contacts").countDocuments({ phone_status: "da_richiamare" });
    const contattato = await db.collection("contacts").countDocuments({ phone_status: "contattato" });
    
    // Restituisci i conteggi
    return NextResponse.json({
      total,
      non_contattato,
      non_ha_risposto,
      da_richiamare,
      contattato
    });
  } catch (error) {
    console.error("Failed to fetch contact stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact stats", details: String(error) }, 
      { status: 500 }
    );
  }
}
