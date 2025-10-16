import AdminClient from "./AdminClient";
import { listGuests } from "../../../../src/lib/supabase-contacts";

export const dynamic = "force-dynamic"; // ensure fresh data when fetching client-side

export default async function CocktailAdminPage() {
  const guests = await listGuests('cocktail');
  
  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #E6F2FF 0%, #B3D1FF 100%)', 
        padding: 20, 
        borderRadius: 8, 
        border: '2px solid #4D94FF',
        marginBottom: 24 
      }}>
        <h1 style={{ color: '#003366', textAlign: 'center', margin: '0 0 8px 0' }}>
          🍸 Cocktail Party EXCLUSIVE Admin 🍸
        </h1>
        <p style={{ textAlign: 'center', margin: 0, fontStyle: 'italic' }}>
          Monitor RSVPs for guests invited to the Cocktail Party ({guests.length} guests)
        </p>
      </div>
      <AdminClient eventType="cocktail" />
    </main>
  );
}