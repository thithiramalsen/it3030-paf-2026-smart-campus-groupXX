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

  const getStatusStyles = (status) => {
    switch (status) {
      case "OPEN":
        return { background: "#fee2e2", color: "#991b1b" };
      case "IN_PROGRESS":
        return { background: "#fef3c7", color: "#92400e" };
      default:
        return { background: "#e2e8f0", color: "#334155" };
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "HIGH":
        return { background: "#fee2e2", color: "#b91c1c" };
      case "MEDIUM":
        return { background: "#ffedd5", color: "#9a3412" };
      case "LOW":
        return { background: "#e0f2fe", color: "#075985" };
      default:
        return { background: "#e2e8f0", color: "#334155" };
    }
  };

  const humanizeFromEmail = (email) => {
    if (!email || typeof email !== "string") return "";
    const localPart = email.split("@")[0] || "";
    return localPart
      .replace(/[._-]+/g, " ")
      .trim()
      .replace(/\b\w/g, (ch) => ch.toUpperCase());
  };

  const getIssuerName = (ticket) => {
    const direct =
      ticket.createdByName ||
      ticket.userName ||
      ticket.issuedBy ||
      ticket.createdBy ||
      ticket.reportedBy ||
      ticket.requester;

    if (direct && String(direct).trim()) return String(direct).trim();

    const emailLike = ticket.createdByEmail || ticket.email;
    const inferred = humanizeFromEmail(emailLike);
    return inferred || emailLike || "Unknown User";
  };

  const formatCreatedAt = (value) => {
    if (!value) return "Unknown";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
  };

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "24px auto 42px",
        padding: "0 16px",
        fontFamily: "Manrope, Segoe UI, sans-serif",
        color: "#0f172a",
      }}
    >
      <section
        style={{
          borderRadius: 18,
          padding: "18px 20px",
          background: "linear-gradient(135deg, #ecfeff 0%, #f8fafc 60%, #f0f9ff 100%)",
          border: "1px solid #bae6fd",
          boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.02em" }}>Assigned Tickets</h2>
            <p style={{ margin: "8px 0 0", color: "#475569" }}>
              Manage your active incident queue and track ticket ownership.
            </p>
          </div>
          <div
            style={{
              alignSelf: "flex-start",
              padding: "8px 12px",
              borderRadius: 999,
              background: "#0f172a",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {visibleTickets.length} Active
          </div>
        </div>
      </section>

      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: 12,
            padding: "10px 12px",
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      )}

      {visibleTickets.length === 0 && (
        <div
          style={{
            border: "1px dashed #cbd5e1",
            borderRadius: 14,
            padding: 24,
            textAlign: "center",
            color: "#475569",
            background: "#f8fafc",
          }}
        >
          No tickets assigned yet.
        </div>
      )}

      <div style={{ display: "grid", gap: 14 }}>
        {visibleTickets.map((ticket) => {
          const statusStyle = getStatusStyles(ticket.status);
          const priorityStyle = getPriorityStyles(ticket.priority);

          return (
            <article
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: 16,
                background: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 6px 16px rgba(15, 23, 42, 0.05)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 20 }}>{ticket.title}</h3>
                  <p style={{ margin: "8px 0 0", color: "#64748b" }}>#{ticket.id}</p>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <span
                    style={{
                      background: statusStyle.background,
                      color: statusStyle.color,
                      borderRadius: 999,
                      padding: "5px 10px",
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {ticket.status}
                  </span>
                  <span
                    style={{
                      background: priorityStyle.background,
                      color: priorityStyle.color,
                      borderRadius: 999,
                      padding: "5px 10px",
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {ticket.priority} PRIORITY
                  </span>
                </div>
              </div>

              <p style={{ margin: "12px 0", color: "#334155", lineHeight: 1.5 }}>
                {ticket.description || "No description provided."}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 10,
                }}
              >
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                  <strong>Issued By</strong>
                  <div style={{ marginTop: 4, color: "#334155" }}>{getIssuerName(ticket)}</div>
                </div>

                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                  <strong>Created</strong>
                  <div style={{ marginTop: 4, color: "#334155" }}>{formatCreatedAt(ticket.createdAt)}</div>
                </div>

                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                  <strong>Resource</strong>
                  <div style={{ marginTop: 4, color: "#334155" }}>
                    {ticket.resourceName || "-"}
                    {ticket.resourceLocation ? ` (${ticket.resourceLocation})` : ""}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
