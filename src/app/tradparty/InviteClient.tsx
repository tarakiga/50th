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
      const resp = await fetch(`/api/${eventType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action })
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || "Request failed");
      }
      
      const responseData = await resp.json();
      setStatus("done");
      
      if (action === "attending") {
        const viaSMS = responseData?.channel === "sms" || (process.env.NEXT_PUBLIC_DETAILS_VIA_SMS === "true");
        if (responseData.message && responseData.message.includes("WhatsApp disabled")) {
          setMessage(viaSMS
            ? "🎉 Your RSVP has been recorded! Event details will be shared via SMS closer to the date."
            : "🎉 Your RSVP has been recorded! Event details will be shared via WhatsApp closer to the date.");
        } else {
          setMessage(viaSMS
            ? "🎉 You're all set! Check text messages for your private event details and location information."
            : "🎉 You're all set! Check WhatsApp for your private event details and location information.");
        }
      } else {
        setMessage("Thanks for letting us know. We'll miss you!");
      }
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.message || "Something went wrong");
    }
  }

  const disabled = status === "loading-attend" || status === "loading-decline" || status === "done";

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, justifyContent: 'center' }}>
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