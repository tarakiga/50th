import { findGuestByToken } from "@/src/lib/supabase-contacts";
import InviteClient from "./InviteClient";

export default async function InvitePage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token || "";
  if (!token) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Invitation</h1>
        <p>Missing token.</p>
      </main>
    );
  }

  try {
    const guest = await findGuestByToken(token);
    if (!guest) {
      return (
        <main style={{ padding: 24 }}>
          <h1>Invitation</h1>
          <p>We couldn't find your invitation. Please contact the host.</p>
        </main>
      );
    }

    return (
      <main style={{ padding: 24, display: 'grid', gap: 16 }}>
        <h1>You're invited, {guest.Name}!</h1>
        <p>Event: {process.env.EVENT_NAME || 'Golden Hour Cocktail'}</p>
        <p>Location: Sent privately upon confirmation.</p>
        <InviteClient token={token} guestName={guest.Name} />
      </main>
    );
  } catch (e) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Invitation</h1>
        <p>There was an error loading your invitation. Please try again later.</p>
      </main>
    );
  }
}
