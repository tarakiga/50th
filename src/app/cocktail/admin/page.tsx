import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic"; // ensure fresh data when fetching client-side

export default function CocktailAdminPage() {
  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #E6F3FF 0%, #F0F8FF 100%)', 
        padding: 20, 
        borderRadius: 8, 
        border: '2px solid #4682B4',
        marginBottom: 24 
      }}>
        <h1 style={{ color: '#2F4F4F', textAlign: 'center', margin: '0 0 8px 0' }}>
          🍸 VIP ALL EVENTS Admin 🍸
        </h1>
        <p style={{ textAlign: 'center', margin: 0, fontStyle: 'italic' }}>
          Monitor RSVPs for VIP guests invited to ALL THREE events (171 guests)
        </p>
      </div>
      <AdminClient eventType="cocktail" />
    </main>
  );
}