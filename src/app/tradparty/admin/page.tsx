import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic"; // ensure fresh data when fetching client-side

export default function TradPartyAdminPage() {
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
        <div style={{ 
          textAlign: 'center', 
          margin: '8px 0', 
          padding: '8px 16px', 
          background: '#8B4513', 
          color: 'white', 
          borderRadius: 6,
          border: '2px solid #DAA520',
          fontWeight: 'bold'
        }}>
          🎆 TRADITIONAL ATTIRE EVENT 🎆
        </div>
        <p style={{ textAlign: 'center', margin: 0, fontStyle: 'italic' }}>
          Monitor RSVPs for guests invited ONLY to Traditional Party events (87 guests)
        </p>
      </div>
      <AdminClient eventType="tradparty" />
    </main>
  );
}