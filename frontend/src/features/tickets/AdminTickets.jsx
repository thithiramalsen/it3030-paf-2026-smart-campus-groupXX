import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllTickets,
  assignTechnician,
  updateTicketStatus,
  deleteTicket // ✅ added
} from "../../api/ticketsApi";

const STATUS_OPTIONS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [technician, setTechnician] = useState("");
  const [resolution, setResolution] = useState("");

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

  // ✅ ASSIGN
  const handleAssign = async (id, e) => {
    e.stopPropagation();

    const normalized = normalizeTechnicianInput(technician);
    if (!normalized) return alert("Enter technician email");

    try {
      await assignTechnician(id, normalized);
      setTechnician("");
      loadTickets();
    } catch (err) {
      console.error(err);
      alert("Assign failed");
    }
  };

  const normalizeTechnicianInput = (value) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        return (parsed.technician || "").toString().trim();
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  };

  // ✅ UPDATE
  const handleUpdate = async (id, status, e) => {
    e.stopPropagation();

    try {
      await updateTicketStatus(id, {
        status: status,
        resolutionNotes: resolution,
      });

      setResolution("");
      loadTickets();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
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
              background: filter === s ? "#2563eb" : "#fff",
              color: filter === s ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}

      {/* TICKETS */}
      {filteredTickets.map((t) => (
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
            📍 {t.location} | ⚡ {t.priority} | 🏷 {t.category}
          </p>

          <p><strong>Status:</strong> {t.status}</p>

          <p>
            <strong>Technician:</strong>{" "}
            {formatTechnician(t.technicianAssigned)}
          </p>

          <p>
            <strong>Resolution:</strong>{" "}
            {t.resolutionNotes || "Not resolved yet"}
          </p>

          {/* ASSIGN */}
          <div style={{ marginTop: 10 }}>
            <input
              placeholder="Technician email"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
            />
            <button onClick={(e) => handleAssign(t.id, e)}>
              Assign
            </button>
          </div>

          {/* UPDATE */}
          <div style={{ marginTop: 10 }}>
            <input
              placeholder="Resolution notes"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />

            <div style={{ marginTop: 6 }}>
              <button onClick={(e) => handleUpdate(t.id, "IN_PROGRESS", e)}>
                Start
              </button>

              <button onClick={(e) => handleUpdate(t.id, "RESOLVED", e)}>
                Resolve
              </button>

              <button onClick={(e) => handleUpdate(t.id, "CLOSED", e)}>
                Close
              </button>
            </div>
          </div>

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