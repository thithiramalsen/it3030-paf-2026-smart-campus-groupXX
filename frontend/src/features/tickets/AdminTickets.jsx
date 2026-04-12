import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [technician, setTechnician] = useState("");
  const [resolution, setResolution] = useState("");

  const navigate = useNavigate(); // ✅ navigation

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/tickets");
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

  // ✅ ASSIGN TECHNICIAN (FIXED)
  const handleAssign = async (id, e) => {
    e.stopPropagation();

    if (!technician) return alert("Enter technician name");

    try {
      await axios.put(
        `http://localhost:8080/api/tickets/${id}/assign`,
        technician,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setTechnician("");
      loadTickets();
    } catch (err) {
      console.error(err);
      alert("Assign failed");
    }
  };

  // ✅ UPDATE STATUS (FIXED)
  const handleUpdate = async (id, status, e) => {
    e.stopPropagation();

    try {
      await axios.put(
        `http://localhost:8080/api/tickets/${id}/status`,
        {
          status: status,
          resolutionNotes: resolution,
        }
      );

      setResolution("");
      loadTickets();
    } catch (err) {
      console.error(err);
      alert("Update failed");
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

      {/* 🔥 TICKET LIST */}
      {filteredTickets.map((t) => (
        <div
          key={t.id}
          onClick={() => navigate(`/admin/tickets/${t.id}`)} // ✅ NAVIGATION
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

          <p>
            <strong>Status:</strong> {t.status}
          </p>

          <p>
            <strong>Technician:</strong>{" "}
            {t.technicianAssigned || "Not Assigned"}
          </p>

          <p>
            <strong>Resolution:</strong>{" "}
            {t.resolutionNotes || "Not resolved yet"}
          </p>

          {/* ASSIGN */}
          <div style={{ marginTop: 10 }}>
            <input
              placeholder="Technician name"
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
        </div>
      ))}
    </div>
  );
}