"use client";

import { useState } from "react";

export default function InviteClient({ token, guestName, eventType }: { token: string; guestName: string; eventType: string }) {
  const [status, setStatus] = useState<"idle" | "loading-attend" | "loading-decline" | "done" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function handleRSVP(action: "attending" | "declined") {
    if (!token || token.length < 8) {
      setStatus("error");
      setMessage("Invalid or missing token.");
      return;
    }
    setStatus(action === "attending" ? "loading-attend" : "loading-decline");
    setMessage("");
    try {
      const resp = await fetch(`/api/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action, eventType })
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || "Request failed");
      }
      
      const responseData = await resp.json();
      setStatus("done");
      const responseMessage = action === "attending" 
        ? "Thanks, your attendance has been recorded"
        : "Thanks for your feedback";
      setMessage(responseMessage);
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.message || "Something went wrong");
    }
  }

  const disabled = status === "loading-attend" || status === "loading-decline" || status === "done";

  return (
    <section style={{ display: "grid", gap: 8, maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ 
        padding: '12px 16px', 
        background: 'transparent',
        borderLeft: '3px solid #DAA520',
      }}>
        <div style={{ whiteSpace: 'pre-line', lineHeight: '1.5', fontSize: '15px' }}>
          <strong>Traditional Party</strong>
          <br/>When: 24.10.2025 @ 5pm
          <br/>Where: No.8 Tito Bros Street, Off Jimmy Carter Street, Asokoro, Abuja
          <br/><br/><strong>Disco Tech</strong>
          <br/>When: 25.10.2025 @ 7pm
          <br/>Where: Noon Bar, 45 Gana Street, Maitama Abuja
        </div>
      </div>
      
      <div style={{ display: "flex", gap: 12, justifyContent: 'center', marginTop: '8px' }}>
        <button 
          onClick={() => handleRSVP("attending")} 
          disabled={disabled} 
          aria-busy={status === "loading-attend"}
          style={{
            background: '#DAA520',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {status === "loading-attend" ? "Confirming…" : "🎭 I Will Attend"}
        </button>
        <button 
          onClick={() => handleRSVP("declined")} 
          disabled={disabled} 
          aria-busy={status === "loading-decline"}
          style={{
            background: '#8B4513',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {status === "loading-decline" ? "Submitting…" : "I Can't Make It"}
        </button>
      </div>
      {status !== "idle" && (
        <div style={{ 
          padding: 16, 
          borderRadius: 6, 
          background: status === "error" ? "#FFE4E1" : "#F0FFF0",
          border: `1px solid ${status === "error" ? "#DC143C" : "#32CD32"}`,
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: status === "error" ? "#DC143C" : "#006400" }}>
            {message}
          </p>
        </div>
      )}
    </section>
  );
}