import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTicketById,
  getComments,
  getAttachments,
  addComment,
  assignTechnician
} from "../../api/ticketsApi";
import { adminApi } from "../../api/adminApi";
import { useAuth } from "../auth/AuthContext";
import { useAppFeedback } from "../../components/ui/AppFeedbackProvider";

export default function AdminReplyTickets() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useAppFeedback();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [comment, setComment] = useState("");

  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState("");

  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [assigningTech, setAssigningTech] = useState(false);

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

    } catch (err) {
      console.error(err);
      toast("Failed to load ticket", { type: 'error' });
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
    if (!comment.trim()) {
      toast("Enter a comment", { type: 'warning' });
      return;
    }

    try {
      setSubmittingComment(true);
      await addComment(id, authorLabel, comment);
      setComment("");
      await loadData();
    } catch (err) {
      console.error(err);
      toast("Failed to add comment", { type: 'error' });
    } finally {
      setSubmittingComment(false);
    }
  };

  // ✅ ASSIGN TECHNICIAN
  const handleAssign = async () => {
    if (!selectedTechnician) {
      toast("Select technician", { type: 'warning' });
      return;
    }

    try {
      setAssigningTech(true);
      await assignTechnician(id, normalizeTechnicianInput(selectedTechnician));
      toast("Technician assigned", { type: 'success' });
      await loadData();
    } catch (err) {
      console.error(err);
      toast("Assign failed", { type: 'error' });
    } finally {
      setAssigningTech(false);
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

  const getStatusStyles = (value) => {
    switch (value) {
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

  const formatCreatedAt = (value) => {
    if (!value) return "Unknown";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
  };

  const formatIssuer = (value) => {
    if (value && String(value).trim()) return String(value).trim();
    return "Not available";
  };

  if (loading) return <p>Loading...</p>;
  if (!ticket) return <p>Ticket not found</p>;

  const statusStyle = getStatusStyles(ticket.status);

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
          background: "linear-gradient(135deg, #f0f9ff 0%, #f8fafc 60%, #ecfeff 100%)",
          border: "1px solid #dbeafe",
          boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => navigate("/admin/tickets")}
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Back to Tickets
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.02em" }}>{ticket.title}</h2>
            <p style={{ margin: "8px 0 0", color: "#475569" }}>Ticket #{ticket.id}</p>
          </div>

          <span
            style={{
              alignSelf: "flex-start",
              padding: "6px 12px",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 12,
              background: statusStyle.background,
              color: statusStyle.color,
            }}
          >
            {ticket.status}
          </span>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.45fr 1fr",
          gap: 16,
        }}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <article
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              background: "#fff",
              padding: 16,
              boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
            }}
          >
            <h3 style={{ margin: "0 0 10px" }}>Incident Details</h3>
            <p style={{ marginTop: 0, color: "#334155", lineHeight: 1.6 }}>{ticket.description}</p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 10,
              }}
            >
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                <strong>Category</strong>
                <div style={{ marginTop: 4, color: "#475569" }}>{ticket.category || "-"}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                <strong>Priority</strong>
                <div style={{ marginTop: 4, color: "#475569" }}>{ticket.priority || "-"}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                <strong>Resource</strong>
                <div style={{ marginTop: 4, color: "#475569" }}>
                  {ticket.resourceName || "-"}
                  {ticket.resourceLocation ? ` (${ticket.resourceLocation})` : ""}
                </div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                <strong>Created</strong>
                <div style={{ marginTop: 4, color: "#475569" }}>{formatCreatedAt(ticket.createdAt)}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                <strong>Issued By</strong>
                <div style={{ marginTop: 4, color: "#475569" }}>
                  {formatIssuer(ticket.createdByName || ticket.createdByEmail)}
                </div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                <strong>Assigned Technician</strong>
                <div style={{ marginTop: 4, color: "#475569" }}>{ticket.technicianAssigned || "Not Assigned"}</div>
              </div>
            </div>

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
              <div style={{ marginTop: 4, color: "#166534" }}>{ticket.resolutionNotes || "Not resolved yet"}</div>
            </div>
          </article>

          <article
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              background: "#fff",
              padding: 16,
              boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
            }}
          >
            <h3 style={{ margin: "0 0 10px" }}>Attachments</h3>

            {attachments.length === 0 && <p style={{ color: "#64748b", margin: 0 }}>No attachments uploaded.</p>}

            <div style={{ display: "grid", gap: 10 }}>
              {attachments.map((a) => (
                <a
                  key={a.id}
                  href={`http://localhost:8080/uploads/${a.fileName}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "#f8fafc",
                  }}
                >
                  <img
                    src={`http://localhost:8080/uploads/${a.fileName}`}
                    alt={a.fileName}
                    style={{ width: "100%", maxHeight: 240, objectFit: "cover", display: "block" }}
                  />
                </a>
              ))}
            </div>
          </article>
        </div>

        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <article
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              background: "#fff",
              padding: 16,
              boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
            }}
          >
            <h3 style={{ margin: "0 0 10px" }}>Assign Technician</h3>

            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                marginBottom: 10,
                borderRadius: 10,
                border: "1px solid #cbd5e1",
              }}
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
              disabled={assigningTech}
              style={{
                padding: "10px 14px",
                background: assigningTech ? "#93c5fd" : "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 600,
                cursor: assigningTech ? "not-allowed" : "pointer",
              }}
            >
              {assigningTech ? "Assigning..." : "Assign Technician"}
            </button>
          </article>

          <article
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              background: "#fff",
              padding: 16,
              boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
            }}
          >
            <h3 style={{ margin: "0 0 10px" }}>Comments</h3>

            <div style={{ maxHeight: 280, overflow: "auto", marginBottom: 10, paddingRight: 4 }}>
              {comments.length === 0 && <p style={{ color: "#64748b", marginTop: 0 }}>No comments yet.</p>}

              {comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    marginBottom: 8,
                    background: "#f8fafc",
                  }}
                >
                  <strong>{c.author}</strong>
                  <p style={{ margin: "6px 0 0", color: "#334155" }}>{c.message}</p>
                </div>
              ))}
            </div>

            <textarea
              placeholder="Write a reply..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                padding: 10,
                resize: "vertical",
              }}
            />

            <button
              onClick={handleComment}
              disabled={submittingComment}
              style={{
                marginTop: 10,
                padding: "10px 14px",
                background: submittingComment ? "#93c5fd" : "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 600,
                cursor: submittingComment ? "not-allowed" : "pointer",
              }}
            >
              {submittingComment ? "Posting..." : "Add Reply"}
            </button>
          </article>

          <article
            style={{
              borderRadius: 12,
              border: "1px solid #fde68a",
              background: "#fffbeb",
              color: "#92400e",
              padding: "12px 14px",
              fontSize: 14,
            }}
          >
            Ticket resolution and status updates are technician-managed. Admins can review, assign, and comment.
          </article>
        </div>
      </section>
    </div>
  );
}