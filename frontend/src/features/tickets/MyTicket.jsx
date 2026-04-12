import { useEffect, useState } from "react";
import { getMyTickets } from "../../api/ticketsApi"; // ✅ use API

const STATUS_COLORS = {
  OPEN: "#f59e0b",
  IN_PROGRESS: "#3b82f6",
  RESOLVED: "#22c55e",
  CLOSED: "#6b7280",
  REJECTED: "#ef4444"
};

export default function MyTicket() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await getMyTickets(); // ✅ fixed endpoint + token
      setTickets(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2>🎫 My Tickets</h2>

      {loading && <p>Loading tickets...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && tickets.length === 0 && (
        <p>No tickets found.</p>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {tickets.map((ticket) => (
          <div key={ticket.id} style={{
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: 16,
            background: "#f9fafb"
          }}>
            
            <h3 style={{ marginBottom: 6 }}>{ticket.title}</h3>

            <p style={{ fontSize: 14, color: "#6b7280" }}>
              {ticket.description}
            </p>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
              flexWrap: "wrap",
              gap: 8
            }}>
              <span><strong>Category:</strong> {ticket.category}</span>
              <span><strong>Priority:</strong> {ticket.priority}</span>
              <span><strong>Location:</strong> {ticket.location}</span>
            </div>

            <div style={{ marginTop: 10 }}>
              <span style={{
                padding: "4px 10px",
                borderRadius: 20,
                background: STATUS_COLORS[ticket.status] || "#ccc",
                color: "#fff",
                fontSize: 12
              }}>
                {ticket.status}
              </span>
            </div>

            {ticket.technicianAssigned && (
              <p style={{ marginTop: 8 }}>
                👨‍🔧 Assigned: {ticket.technicianAssigned}
              </p>
            )}

            {ticket.resolutionNotes && (
              <p style={{ marginTop: 8, color: "#16a34a" }}>
                ✅ Resolution: {ticket.resolutionNotes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}