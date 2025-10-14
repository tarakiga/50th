import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic"; // ensure fresh data when fetching client-side

export default function AdminPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>
      <p>Enter your admin token to view RSVP and WhatsApp delivery status.</p>
      <AdminClient />
    </main>
  );
}
