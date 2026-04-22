import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
    <div className="page-block">
      <div className="inline-actions spread">
        <h1>My Tickets</h1>
        <button className="btn-outline" onClick={() => navigate("/tickets/new")}>New Ticket</button>
      </div>

      {loading && <p>Loading tickets...</p>}
      {error && <p className="muted">{error}</p>}

      {!loading && tickets.length === 0 && (
        <p className="muted">No tickets found.</p>
      )}

      <div className="stack-list">
        {tickets.map((ticket) => (
          <article
            key={ticket.id}
            className="card"
            onClick={() => navigate(`/tickets/${ticket.id}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="inline-actions spread">
              <h3>{ticket.title}</h3>
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

            <p className="muted">{ticket.description}</p>

            <div className="inline-actions">
              <span><strong>Category:</strong> {ticket.category}</span>
              <span><strong>Priority:</strong> {ticket.priority}</span>
              <span>
                <strong>Resource:</strong> {ticket.resourceName || "-"}
                {ticket.resourceLocation ? ` (${ticket.resourceLocation})` : ""}
              </span>
            </div>

            {ticket.technicianAssigned && (
              <p><strong>Assigned:</strong> {ticket.technicianAssigned}</p>
            )}

            {ticket.resolutionNotes && (
              <p><strong>Resolution:</strong> {ticket.resolutionNotes}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}