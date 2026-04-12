import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTicketById,
  getComments,
  getAttachments,
  addComment,
  updateTicketStatus,
  assignTechnician
} from "../../api/ticketsApi";
import { adminApi } from "../../api/adminApi";
import { useAuth } from "../auth/AuthContext";

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function AdminReplyTickets() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [resolution, setResolution] = useState("");

  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState("");

  const [loading, setLoading] = useState(true);

  const authorLabel = useMemo(() => {
    return user?.fullName || user?.email || "Admin";
  }, [user]);

  // 🔥 LOAD ALL DATA
  useEffect(() => {
    loadData();
    loadTechnicians();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      const ticketRes = await getTicketById(id);
      const commentRes = await getComments(id);
      const attachRes = await getAttachments(id);

      setTicket(ticketRes.data);
      setComments(commentRes.data);
      setAttachments(attachRes.data);
      setStatus(ticketRes.data.status);

    } catch (err) {
      console.error(err);
      alert("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FETCH TECHNICIANS
  const loadTechnicians = async () => {
    try {
      const res = await adminApi.getUsers();

      const techs = res.data.filter(
        (u) => u.role === "TECHNICIAN"
      );

      setTechnicians(techs);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ ADD COMMENT
  const handleComment = async () => {
    if (!comment) return alert("Enter a comment");

    try {
      await addComment(id, authorLabel, comment);
      setComment("");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to add comment");
    }
  };

  // ✅ ASSIGN TECHNICIAN
  const handleAssign = async () => {
    if (!selectedTechnician) return alert("Select technician");

    try {
      await assignTechnician(id, normalizeTechnicianInput(selectedTechnician));
      alert("Technician assigned");
      loadData();
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

  // ✅ UPDATE STATUS
  const handleUpdate = async () => {
    try {
      await updateTicketStatus(id, {
        status: status,
        resolutionNotes: resolution,
      });

      alert("Updated successfully");
      navigate("/admin/tickets");
    } catch (err) {
      console.error(err);
      alert("Failed to update ticket");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!ticket) return <p>Ticket not found</p>;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>

      {/* BACK */}
      <button onClick={() => navigate("/admin/tickets")} style={{
        marginBottom: 16,
        padding: "6px 12px",
        borderRadius: 6,
        border: "1px solid #ccc"
      }}>
        ← Back
      </button>

      <h2>🎫 Ticket Details & Reply</h2>

      {/* INFO */}
      <div style={{
        border: "1px solid #e5e7eb",
        padding: 16,
        borderRadius: 10
      }}>
        <h3>{ticket.title}</h3>
        <p>{ticket.description}</p>

        <p>📌 {ticket.category} | ⚡ {ticket.priority} | 📍 {ticket.location}</p>
        <p>Status: <strong>{ticket.status}</strong></p>

        <p>👨‍🔧 {ticket.technicianAssigned || "Not Assigned"}</p>

        <p style={{ color: "green" }}>
          ✅ {ticket.resolutionNotes || "Not resolved"}
        </p>
      </div>

      {/* ATTACHMENTS */}
      <div style={{ marginTop: 20 }}>
        <h3>📎 Attachments</h3>

        {attachments.length === 0 && <p>No attachments uploaded.</p>}

        {attachments.map((a) => (
          <a
            key={a.id}
            href={`http://localhost:8080/uploads/${a.fileName}`}
            target="_blank"
            rel="noreferrer"
            style={{ display: "block", marginBottom: 10 }}
          >
            <img
              src={`http://localhost:8080/uploads/${a.fileName}`}
              alt={a.fileName}
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </a>
        ))}
      </div>

      {/* 🔥 ASSIGN TECHNICIAN */}
      <div style={{ marginTop: 20 }}>
        <h3>👨‍🔧 Assign Technician</h3>

        <select
          value={selectedTechnician}
          onChange={(e) => setSelectedTechnician(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        >
          <option value="">Select Technician</option>

          {technicians.map((tech) => (
            <option key={tech.id} value={tech.email}>
              {tech.name || tech.email}
            </option>
          ))}
        </select>

        <button
          onClick={handleAssign}
          style={{
            padding: "8px 16px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
          }}
        >
          Assign Technician
        </button>
      </div>

      {/* COMMENTS */}
      <div style={{ marginTop: 20 }}>
        <h3>💬 Comments</h3>

        {comments.length === 0 && <p>No comments yet.</p>}

        {comments.map((c) => (
          <div key={c.id} style={{
            padding: 10,
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            marginBottom: 6
          }}>
            <strong>{c.author}</strong>
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

      {/* UPDATE */}
      <div style={{ marginTop: 20 }}>
        <h3>🔄 Update Ticket</h3>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ marginBottom: 10 }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <textarea
          placeholder="Resolution notes"
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