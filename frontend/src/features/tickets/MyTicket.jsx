import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTickets } from "../../api/ticketsApi"; // ✅ use API

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
      setTickets(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "OPEN":
        return { background: "#fee2e2", color: "#991b1b" };
      case "IN_PROGRESS":
        return { background: "#fef3c7", color: "#92400e" };
      case "RESOLVED":
        return { background: "#dcfce7", color: "#166534" };
      case "CLOSED":
        return { background: "#e0e7ff", color: "#3730a3" };
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

  const formatCreatedAt = (value) => {
    if (!value) return "Unknown";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
  };

  const summary = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    closed: tickets.filter((t) => t.status === "CLOSED").length,
  };

  return (
    <div
      style={{
        maxWidth: 1120,
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
            <h1 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.02em" }}>My Tickets</h1>
            <p style={{ margin: "8px 0 0", color: "#475569" }}>
              Track your ticket progress and follow responses from support staff.
            </p>
          </div>

          <button
            onClick={() => navigate("/tickets/new")}
            style={{
              alignSelf: "flex-start",
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            New Ticket
          </button>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {[
          { label: "Total", value: summary.total },
          { label: "Open", value: summary.open },
          { label: "In Progress", value: summary.inProgress },
          { label: "Resolved", value: summary.resolved },
          { label: "Closed", value: summary.closed },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: "14px 16px",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ fontSize: 13, color: "#475569" }}>{item.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{item.value}</div>
          </div>
        ))}
      </section>

      {loading && <p style={{ color: "#334155" }}>Loading tickets...</p>}

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

      {!loading && tickets.length === 0 && (
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
          No tickets found.
        </div>
      )}

      <div style={{ display: "grid", gap: 14 }}>
        {tickets.map((ticket) => {
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
                  <strong>Category</strong>
                  <div style={{ marginTop: 4, color: "#334155" }}>{ticket.category || "-"}</div>
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

                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                  <strong>Assigned Technician</strong>
                  <div style={{ marginTop: 4, color: "#334155" }}>{ticket.technicianAssigned || "Not Assigned"}</div>
                </div>
              </div>

              {ticket.resolutionNotes && (
                <div
                  style={{
                    marginTop: 12,
                    borderRadius: 10,
                    padding: "10px 12px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <strong style={{ color: "#166534" }}>Resolution</strong>
                  <div style={{ marginTop: 4, color: "#166534" }}>{ticket.resolutionNotes}</div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}