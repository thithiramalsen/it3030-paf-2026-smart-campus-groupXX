import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllTickets,
  deleteTicket // ✅ added
} from "../../api/ticketsApi";

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

  const navigate = useNavigate();

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await getAllTickets();
      setTickets(res.data);
    } catch (err) {
      console.error(err);
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

  // 🔥 DELETE
  const handleDelete = async (id, e) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    try {
      await deleteTicket(id);
      loadTickets();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <h2>🛠 Admin Ticket Dashboard</h2>

      {/* FILTER */}
      <div style={{ marginBottom: 20 }}>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              marginRight: 8,
              padding: "6px 12px",
              borderRadius: 20,
              border: "1px solid #ccc",
              background: filter === s ? "#0f172a" : "#fff",
              color: filter === s ? "#fff" : "#0f172a",
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 10, fontWeight: 600 }}>Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ccc" }}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}

      {/* TICKETS */}
      {sortedTickets.map((t) => (
        <div
          key={t.id}
          onClick={() => navigate(`/admin/tickets/${t.id}`)}
          style={{
            border: "1px solid #ddd",
            padding: 16,
            marginBottom: 16,
            borderRadius: 10,
            background: "#fff",
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#f9fafb")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "#fff")
          }
        >
          <h3>{t.title}</h3>

          <p>{t.description}</p>

          <p>
            📍 {t.resourceName || "-"}{t.resourceLocation ? ` (${t.resourceLocation})` : ""} | ⚡ {t.priority} | 🏷 {t.category}
          </p>

          <p><strong>Created:</strong> {formatCreatedAt(t.createdAt)}</p>

          <p><strong>Status:</strong> {t.status}</p>

          <p>
            <strong>Technician:</strong>{" "}
            {formatTechnician(t.technicianAssigned)}
          </p>

          <p>
            <strong>Resolution:</strong>{" "}
            {t.resolutionNotes || "Not resolved yet"}
          </p>

          {/* 🔥 DELETE BUTTON */}
          <button
            onClick={(e) => handleDelete(t.id, e)}
            style={{
              marginTop: 12,
              padding: "6px 12px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 6
            }}
          >
            Delete Ticket
          </button>
        </div>
      ))}
    </div>
  );
}