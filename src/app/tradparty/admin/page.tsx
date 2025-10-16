import AdminClient from "./AdminClient";
import { listGuests } from "../../../../src/lib/supabase-contacts";

export const dynamic = "force-dynamic"; // ensure fresh data when fetching client-side

export default async function TradPartyAdminPage() {
  const guests = await listGuests('tradparty');
  
  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #FFF8DC 0%, #F5DEB3 100%)', 
        padding: 20, 
        borderRadius: 8, 
        border: '2px solid #DAA520',
        marginBottom: 24 
      }}>
        <h1 style={{ color: '#8B4513', textAlign: 'center', margin: '0 0 8px 0' }}>
          🎭 Traditional Party EXCLUSIVE Admin 🎭
        </h1>
        <p style={{ textAlign: 'center', margin: 0, fontStyle: 'italic' }}>
          Monitor RSVPs for guests invited ONLY to Traditional Party events ({guests.length} guests)
        </p>
      </div>
      <AdminClient eventType="tradparty" />
    </main>
  );
}