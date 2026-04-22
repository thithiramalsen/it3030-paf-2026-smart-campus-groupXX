import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssignedTickets } from "../../api/ticketsApi";

export default function AssignedTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    getAssignedTickets()
      .then((res) => alive && setTickets(res.data || []))
      .catch(() => alive && setError("Failed to load assigned tickets."))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <p>Loading assigned tickets...</p>;

  const visibleTickets = tickets.filter(
    (ticket) => ticket.status !== "RESOLVED" && ticket.status !== "CLOSED"
  );

  return (
    <div className="page-block">
      <div className="inline-actions spread">
        <h2>Assigned Tickets</h2>
        <span className="muted">{visibleTickets.length} active</span>
      </div>

      {error && <p className="muted">{error}</p>}
      {visibleTickets.length === 0 && <p className="muted">No tickets assigned yet.</p>}

      <div className="stack-list">
        {visibleTickets.map((ticket) => (
          <article
            key={ticket.id}
            className="card"
            onClick={() => navigate(`/tickets/${ticket.id}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="inline-actions spread">
              <h3>{ticket.title}</h3>
              <strong>{ticket.status}</strong>
            </div>
            <p className="muted">{ticket.description}</p>
            <div className="inline-actions">
              <span><strong>Priority:</strong> {ticket.priority}</span>
              <span>
                <strong>Resource:</strong> {ticket.resourceName || "-"}
                {ticket.resourceLocation ? ` (${ticket.resourceLocation})` : ""}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
