// app/api/contacts/stats/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("consignment");
    
    // Usa aggregation pipeline per ottenere conteggi accurati in una sola query
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
    
    // Estrai i risultati o utilizza valori predefiniti se vuoti
    const result = stats.length > 0 ? stats[0] : {
      total: 0,
      non_contattato: 0,
      non_ha_risposto: 0,
      da_richiamare: 0,
      contattato: 0
    };
    
    // Rimuovi il campo _id che è stato aggiunto dall'aggregazione
    delete result._id;
    
    // Crea la risposta con i dati
    const response = NextResponse.json(result);
    
    // Imposta gli header per evitare completamente il caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
  } catch (error) {
    console.error("Failed to fetch contact stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact stats", details: String(error) }, 
      { status: 500 }
    );
  }
}
