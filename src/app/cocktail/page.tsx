import { findGuestByToken } from "@/src/lib/contacts";
import InviteClient from "./InviteClient";

export default async function CocktailPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token || "";
  if (!token) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Cocktail Event Invitation</h1>
        <p>Missing token.</p>
      </main>
    );
  }

  try {
    const guest = await findGuestByToken(token, 'cocktail');
    if (!guest) {
      return (
        <main style={{ padding: 24 }}>
          <h1>Cocktail Event Invitation</h1>
          <p>We couldn't find your invitation. Please contact the host.</p>
        </main>
      );
    }

    const eventName = process.env.COCKTAIL_EVENT_NAME || "Cocktail";
    const eventDetails = (process.env.COCKTAIL_DETAILS || "Details will be shared privately").replace(/\\n/g, '\n');

    return (
      <main style={{ 
        minHeight: '100vh',
        background: '#14243b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'serif'
      }}>
        <div style={{ 
          maxWidth: 600, 
          width: '100%',
          background: '#14243b',
          border: '3px solid #f5dd75',
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
          color: '#f5dd75'
        }}>
          {/* Crown Icon */}
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
            <img 
              src="/crown.png" 
              alt="Crown" 
              style={{ 
                width: '80px', 
                height: '80px' 
              }} 
            />
          </div>
          
          {/* Main Heading */}
          <h2 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '2.5rem', 
            fontWeight: '300',
            color: '#f5dd75',
            letterSpacing: '2px'
          }}>
            GOLDEN JUBILEE
          </h2>
          
          {/* Invitation Text */}
          <p style={{ 
            fontSize: '1.1rem', 
            fontStyle: 'italic', 
            margin: '0 0 30px 0',
            color: 'white',
            lineHeight: '1.6'
          }}>
            You are cordially invited to celebrate the<br/>
            50th Birthday of
          </p>
          
          {/* Name */}
          <h2 style={{ 
            margin: '0 0 30px 0', 
            fontSize: '2.2rem', 
            fontWeight: '400',
            color: '#f5dd75',
            letterSpacing: '1px'
          }}>
            DENEN IKYA
          </h2>
          
          {/* Guest Name */}
          <p style={{ 
            fontSize: '1rem', 
            margin: '0 0 25px 0',
            color: 'white',
            fontStyle: 'normal'
          }}>
            Dear {guest.Name}
          </p>
          
          {/* VIP Badge */}
          <div style={{
            background: 'rgba(245, 221, 117, 0.2)',
            border: '2px solid #f5dd75',
            borderRadius: 8,
            padding: 12,
            margin: '20px 0',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            color: '#f5dd75'
          }}>
            🎉 VIP ACCESS - ALL THREE EVENTS! 🎉
          </div>
          
          {/* Event Details */}
          <div style={{ 
            background: 'rgba(245, 221, 117, 0.1)',
            border: '1px solid #f5dd75',
            borderRadius: 8,
            padding: 25,
            margin: '25px 0',
            fontSize: '1rem',
            lineHeight: '1.8',
            whiteSpace: 'pre-line',
            color: 'white'
          }}>
            {eventDetails}
          </div>
          
          {/* RSVP Info */}
          <p style={{ 
            fontSize: '0.9rem', 
            margin: '25px 0',
            color: '#f5dd75',
            borderTop: '1px solid #f5dd75',
            paddingTop: '20px'
          }}>
            RSVP +234 703 223 2198 | +234 809 667 7883
          </p>
          
          {/* RSVP Buttons */}
          <InviteClient token={token} guestName={guest.Name} eventType="cocktail" />
        </div>
      </main>
    );
  } catch (e) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Cocktail Event Invitation</h1>
        <p>There was an error loading your invitation. Please try again later.</p>
      </main>
    );
  }
}