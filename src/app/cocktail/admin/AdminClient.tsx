"use client";

import { useMemo, useState, useEffect } from "react";

interface Item {
  Name: string;
  PhoneNumber: string;
  Token: string;
  RSVPStatus: string;
  WhatsAppDeliveryStatus?: string;
  UpdatedAt?: string;
}

export default function AdminClient({ eventType }: { eventType: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [filter, setFilter] = useState<"All" | "Attending" | "Declined" | "None">("All");

  const filtered = useMemo(() => {
    if (!items) return [];
    if (filter === "All") return items;
    return items.filter((i) => i.RSVPStatus === filter);
  }, [items, filter]);

  const stats = useMemo(() => {
    if (!items) return { total: 0, attending: 0, declined: 0, none: 0, withPhone: 0 };
    return {
      total: items.length,
      attending: items.filter(i => i.RSVPStatus === 'Attending').length,
      declined: items.filter(i => i.RSVPStatus === 'Declined').length,
      none: items.filter(i => i.RSVPStatus === 'None' || !i.RSVPStatus).length,
      withPhone: items.filter(i => i.PhoneNumber && i.PhoneNumber.length > 0).length
    };
  }, [items]);

  async function fetchAdmin() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/${eventType}/admin`, {
        cache: "no-store",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching admin data:", errorText);
        throw new Error(errorText || "Failed to load admin data");
      }
      
      const result = await response.json();
      console.log("Admin data fetched:", result);
      
      // The API returns { items: [...] }
      const items = result?.items || [];
      
      if (!Array.isArray(items)) {
        throw new Error("Invalid data format received from server");
      }
      
      setItems(items);
    } catch (e: any) {
      console.error("Error in fetchAdmin:", e);
      setError(e?.message || "Failed to load admin data");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  // Auto-load data on component mount
  useEffect(() => {
    fetchAdmin();
  }, [eventType]);

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button 
            onClick={fetchAdmin} 
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #4682B4 0%, #5F9EA0 100%)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Refreshing…" : "Refresh Data"}
          </button>
          <span style={{ color: '#666', fontSize: '0.9em' }}>
            Auto-refreshes every page load
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontSize: '0.9em', color: '#666' }}>Filter:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option>All</option>
            <option>Attending</option>
            <option>Declined</option>
            <option>None</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ 
          background: '#FFE4E1', 
          border: '1px solid #DC143C', 
          borderRadius: 4, 
          padding: 12 
        }}>
          <p style={{ color: '#DC143C', margin: 0 }}>
            {error}
          </p>
        </div>
      )}

      {items && (
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 16, 
            marginBottom: 24,
            padding: 16,
            background: '#F0FFFF',
            borderRadius: 8,
            border: '1px solid #4682B4'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#2F4F4F' }}>{stats.total}</div>
              <div>Total Guests</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#228B22' }}>{stats.attending}</div>
              <div>Attending</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#DC143C' }}>{stats.declined}</div>
              <div>Declined</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#808080' }}>{stats.none}</div>
              <div>No Response</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#4682B4' }}>{stats.withPhone}</div>
              <div>With Phone</div>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", background: 'white', borderRadius: 8 }}>
              <thead>
                <tr style={{ background: '#E6F3FF' }}>
                  <th style={{ textAlign: "left", borderBottom: "2px solid #4682B4", padding: 12 }}>Name</th>
                  <th style={{ textAlign: "left", borderBottom: "2px solid #4682B4", padding: 12 }}>Phone</th>
                  <th style={{ textAlign: "left", borderBottom: "2px solid #4682B4", padding: 12 }}>RSVP</th>
                  <th style={{ textAlign: "left", borderBottom: "2px solid #4682B4", padding: 12 }}>WhatsApp</th>
                  <th style={{ textAlign: "left", borderBottom: "2px solid #4682B4", padding: 12 }}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i, index) => (
                  <tr key={i.Token} style={{ background: index % 2 === 0 ? '#FAFAFA' : 'white' }}>
                    <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{i.Name}</td>
                    <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{i.PhoneNumber}</td>
                    <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: 4, 
                        fontSize: '0.9em',
                        background: i.RSVPStatus === 'Attending' ? '#E8F5E8' : 
                                   i.RSVPStatus === 'Declined' ? '#FFE4E1' : '#F5F5F5',
                        color: i.RSVPStatus === 'Attending' ? '#228B22' : 
                               i.RSVPStatus === 'Declined' ? '#DC143C' : '#808080'
                      }}>
                        {i.RSVPStatus || "None"}
                      </span>
                    </td>
                    <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{i.WhatsAppDeliveryStatus || ""}</td>
                    <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>
                      {i.UpdatedAt ? new Date(i.UpdatedAt).toLocaleString() : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, color: '#666', fontSize: '0.9em' }}>
            Showing {filtered.length} of {items.length} guests
          </div>
        </div>
      )}

      {loading && !items && (
        <div style={{ 
          textAlign: 'center', 
          padding: 40, 
          color: '#666',
          background: '#FAFAFA',
          borderRadius: 8,
          border: '1px dashed #ccc'
        }}>
          <p>Loading guest data...</p>
        </div>
      )}
    </section>
  );
}