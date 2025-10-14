"use client";

import { useMemo, useState } from "react";

interface Item {
  Name: string;
  PhoneNumber: string;
  Token: string;
  RSVPStatus: string;
  WhatsAppDeliveryStatus?: string;
  UpdatedAt?: string;
}

export default function AdminClient() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [filter, setFilter] = useState<"All" | "Attending" | "Declined" | "None">("All");

  const filtered = useMemo(() => {
    if (!items) return [];
    if (filter === "All") return items;
    return items.filter((i) => i.RSVPStatus === filter);
  }, [items, filter]);

  async function fetchAdmin() {
    setLoading(true);
    setError(null);
    setItems(null);
    try {
      const resp = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data = (await resp.json()) as { items: Item[] };
      setItems(data.items || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ marginTop: 16, display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span>Admin Token</span>
        <input
          type="password"
          placeholder="Paste ADMIN_TOKEN"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{ maxWidth: 420, padding: 8 }}
        />
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={fetchAdmin} disabled={!token || loading}>
          {loading ? "Loading…" : "Load"}
        </button>
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
          <option>All</option>
          <option>Attending</option>
          <option>Declined</option>
          <option>None</option>
        </select>
      </div>

      {error && (
        <p role="alert" style={{ color: "crimson" }}>
          {error}
        </p>
      )}

      {items && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Name</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Phone</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>RSVP</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>WhatsApp</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.Token}>
                  <td style={{ padding: 8 }}>{i.Name}</td>
                  <td style={{ padding: 8 }}>{i.PhoneNumber}</td>
                  <td style={{ padding: 8 }}>{i.RSVPStatus || "None"}</td>
                  <td style={{ padding: 8 }}>{i.WhatsAppDeliveryStatus || ""}</td>
                  <td style={{ padding: 8 }}>{i.UpdatedAt || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!items && !loading && !error && (
        <p aria-live="polite">No data loaded. Enter your admin token and click Load.</p>
      )}
    </section>
  );
}
