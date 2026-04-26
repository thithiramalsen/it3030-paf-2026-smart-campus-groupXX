import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllTickets,
  deleteTicket,
} from "../../api/ticketsApi";
import { useAppFeedback } from "../../components/ui/AppFeedbackProvider";

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "ALL"];
const SORT_OPTIONS = [
  { value: "DATE_DESC", label: "Newest first" },
  { value: "DATE_ASC", label: "Oldest first" },
  { value: "PRIORITY_DESC", label: "Priority: High to Low" },
  { value: "PRIORITY_ASC", label: "Priority: Low to High" },
];

const PRIORITY_WEIGHT = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("OPEN");
  const [sortBy, setSortBy] = useState("DATE_DESC");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { confirm, toast } = useAppFeedback();

  const loadTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllTickets();
      setTickets(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load tickets. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filteredTickets =
    filter === "ALL"
      ? tickets
      : tickets.filter((t) => t.status === filter);

  const getDateValue = (ticket) => {
    if (ticket.createdAt) {
      const parsed = Date.parse(ticket.createdAt);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return Number(ticket.id) || 0;
  };

  const getPriorityValue = (ticket) => {
    return PRIORITY_WEIGHT[ticket.priority] || 0;
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
    const directName =
      ticket.createdByName ||
      ticket.userName ||
      ticket.issuedBy ||
      ticket.createdBy ||
      ticket.reportedBy ||
      ticket.requester;

    if (directName && String(directName).trim()) {
      return String(directName).trim();
    }

    const emailLike = ticket.createdByEmail || ticket.email;
    const inferred = humanizeFromEmail(emailLike);
    return inferred || emailLike || "Unknown User";
  };

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    switch (sortBy) {
      case "DATE_ASC":
        return getDateValue(a) - getDateValue(b);
      case "PRIORITY_DESC":
        return getPriorityValue(b) - getPriorityValue(a) || getDateValue(b) - getDateValue(a);
      case "PRIORITY_ASC":
        return getPriorityValue(a) - getPriorityValue(b) || getDateValue(b) - getDateValue(a);
      case "DATE_DESC":
      default:
        return getDateValue(b) - getDateValue(a);
    }
  });

  const formatTechnician = (value) => {
    if (!value) return "Not Assigned";
    if (value.startsWith("{") && value.endsWith("}")) {
      try {
        const parsed = JSON.parse(value);
        return parsed.technician || value;
      } catch {
        return value;
      }
    }
    return value;
  };

  const formatCreatedAt = (value) => {
    if (!value) return "Unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return date.toLocaleString();
  };

  const statusColors = {
    OPEN: { bg: "#fee2e2", text: "#991b1b" },
    IN_PROGRESS: { bg: "#fef3c7", text: "#92400e" },
    RESOLVED: { bg: "#dcfce7", text: "#166534" },
    CLOSED: { bg: "#e0e7ff", text: "#3730a3" },
  };

  const priorityColors = {
    HIGH: { bg: "#fee2e2", text: "#b91c1c" },
    MEDIUM: { bg: "#ffedd5", text: "#9a3412" },
    LOW: { bg: "#e0f2fe", text: "#075985" },
  };

  const getStatusStyle = (status) => statusColors[status] || { bg: "#e5e7eb", text: "#374151" };
  const getPriorityStyle = (priority) => priorityColors[priority] || { bg: "#e5e7eb", text: "#374151" };

  const summary = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    closed: tickets.filter((t) => t.status === "CLOSED").length,
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();

    const approved = await confirm({
      title: 'Delete ticket?',
      message: 'Are you sure you want to delete this ticket?',
      confirmText: 'Delete',
      tone: 'danger',
    });
    if (!approved) return;

    try {
      await deleteTicket(id);
      await loadTickets();
    } catch (err) {
      console.error(err);
      toast("Delete failed", { type: 'error' });
    }
  };

  return (
    <div
      style={{
        maxWidth: 1180,
        margin: "24px auto 48px",
        padding: "0 16px",
        fontFamily: "Manrope, Segoe UI, sans-serif",
        color: "#0f172a",
      }}
    >
      <section
        style={{
          background: "linear-gradient(135deg, #f0f9ff 0%, #ecfeff 45%, #f8fafc 100%)",
          border: "1px solid #dbeafe",
          borderRadius: 18,
          padding: "20px 22px",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.07)",
          marginBottom: 18,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.02em" }}>Admin Ticket Dashboard</h2>
        <p style={{ margin: "8px 0 0", color: "#334155" }}>
          Review all incidents, track status, and identify who raised each ticket.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 12,
          marginBottom: 18,
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

      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          padding: "14px",
          marginBottom: 18,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "7px 12px",
                borderRadius: 999,
                border: filter === s ? "1px solid #0f172a" : "1px solid #cbd5e1",
                background: filter === s ? "#0f172a" : "#f8fafc",
                color: filter === s ? "#ffffff" : "#1e293b",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {s === "IN_PROGRESS" ? "IN PROGRESS" : s}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ color: "#334155", fontWeight: 600 }}>Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={loadTickets}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
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

      {!loading && sortedTickets.length === 0 && (
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
          No tickets found for the selected filter.
        </div>
      )}

      <div style={{ display: "grid", gap: 14 }}>
        {sortedTickets.map((t) => {
          const statusStyle = getStatusStyle(t.status);
          const priorityStyle = getPriorityStyle(t.priority);

          return (
            <article
              key={t.id}
              onClick={() => navigate(`/admin/tickets/${t.id}`)}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: 16,
                background: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 5px 14px rgba(15, 23, 42, 0.05)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 20 }}>{t.title}</h3>
                  <p style={{ margin: "8px 0 0", color: "#475569" }}>#{t.id}</p>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <span
                    style={{
                      background: statusStyle.bg,
                      color: statusStyle.text,
                      borderRadius: 999,
                      padding: "5px 10px",
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {t.status}
                  </span>
                  <span
                    style={{
                      background: priorityStyle.bg,
                      color: priorityStyle.text,
                      borderRadius: 999,
                      padding: "5px 10px",
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {t.priority} PRIORITY
                  </span>

                  <button
                    onClick={(e) => handleDelete(t.id, e)}
                    style={{
                      padding: "6px 10px",
                      background: "#dc2626",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p style={{ margin: "12px 0", color: "#334155", lineHeight: 1.5 }}>
                {t.description || "No description provided."}
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
                  <div style={{ marginTop: 4, color: "#334155" }}>{getIssuerName(t)}</div>
                </div>

                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                  <strong>Created</strong>
                  <div style={{ marginTop: 4, color: "#334155" }}>{formatCreatedAt(t.createdAt)}</div>
                </div>

                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                  <strong>Resource</strong>
                  <div style={{ marginTop: 4, color: "#334155" }}>
                    {t.resourceName || "-"}
                    {t.resourceLocation ? ` (${t.resourceLocation})` : ""}
                  </div>
                </div>

                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                  <strong>Category</strong>
                  <div style={{ marginTop: 4, color: "#334155" }}>{t.category || "-"}</div>
                </div>

                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                  <strong>Technician</strong>
                  <div style={{ marginTop: 4, color: "#334155" }}>{formatTechnician(t.technicianAssigned)}</div>
                </div>

                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                  <strong>Resolution</strong>
                  <div style={{ marginTop: 4, color: "#334155" }}>{t.resolutionNotes || "Not resolved yet"}</div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}