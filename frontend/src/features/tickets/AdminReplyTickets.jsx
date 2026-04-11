import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

export default function AdminReplyTickets() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [resolution, setResolution] = useState("");

  const [loading, setLoading] = useState(true);

  // Load ticket
  useEffect(() => {
    fetchTicket();
  }, []);

  const fetchTicket = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/tickets/${id}`);
      setTicket(res.data);
      setStatus(res.data.status);
    } catch {
      alert("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  // Add comment
  const handleComment = async () => {
    if (!comment) return alert("Enter a comment");

    try {
      await axios.post(`http://localhost:8080/api/tickets/${id}/comments`, {
        message: comment,
      });
      setComment("");
      fetchTicket();
    } catch {
      alert("Failed to add comment");
    }
  };

  // Update status + resolution
  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:8080/api/tickets/${id}/status`, {
        status,
        resolutionNotes: resolution,
      });
      alert("Updated successfully");
      navigate("/admin/tickets");
    } catch {
      alert("Failed to update ticket");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!ticket) return <p>Ticket not found</p>;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
      <button onClick={() => navigate("/admin/tickets")} style={{
        marginBottom: 16,
        padding: "6px 12px",
        borderRadius: 6,
        border: "1px solid #ccc"
      }}>
        ← Back
      </button>

      <h2>🎫 Ticket Details</h2>

      {/* Ticket Info */}
      <div style={{ border: "1px solid #e5e7eb", padding: 16, borderRadius: 10 }}>
        <h3>{ticket.title}</h3>
        <p>{ticket.description}</p>

        <p>📌 {ticket.category} | ⚡ {ticket.priority} | 📍 {ticket.location}</p>
        <p>Status: <strong>{ticket.status}</strong></p>

        {ticket.technicianAssigned && (
          <p>👨‍🔧 {ticket.technicianAssigned}</p>
        )}

        {ticket.resolutionNotes && (
          <p style={{ color: "green" }}>
            ✅ {ticket.resolutionNotes}
          </p>
        )}
      </div>

      {/* Comments Section */}
      <div style={{ marginTop: 20 }}>
        <h3>💬 Comments</h3>

        {ticket.comments?.length === 0 && <p>No comments yet.</p>}

        {ticket.comments?.map((c) => (
          <div key={c.id} style={{
            padding: 10,
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            marginBottom: 6
          }}>
            <p>{c.message}</p>
          </div>
        ))}

        <textarea
          placeholder="Write a reply..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          style={{ width: "100%", marginTop: 10 }}
        />

        <button onClick={handleComment} style={{
          marginTop: 8,
          padding: "6px 12px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 6
        }}>
          Add Reply
        </button>
      </div>

      {/* Update Section */}
      <div style={{ marginTop: 20 }}>
        <h3>🔄 Update Ticket</h3>

        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          style={{ display: "block", marginBottom: 10 }}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <label>Resolution Notes</label>
        <textarea
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          rows={3}
          style={{ width: "100%" }}
        />

        <button onClick={handleUpdate} style={{
          marginTop: 10,
          padding: "8px 16px",
          background: "#22c55e",
          color: "#fff",
          border: "none",
          borderRadius: 6
        }}>
          Update Ticket
        </button>
      </div>
    </div>
  );
}