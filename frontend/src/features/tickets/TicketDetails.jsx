import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTicketById,
  getComments,
  getAttachments,
  addComment,
  assignTechnician,
  updateTicketStatus
} from "../../api/ticketsApi"; // ✅ use API
import { useAuth } from "../auth/AuthContext";

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [newComment, setNewComment] = useState("");
  const [technician, setTechnician] = useState("");
  const [resolution, setResolution] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [assigningTech, setAssigningTech] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const role = user?.role || "USER";
  const isAdmin = role === "ADMIN";
  const isTechnician = role === "TECHNICIAN";
  const canManageStatus = isTechnician;
  const isResolvedOrClosed = ticket?.status === "RESOLVED" || ticket?.status === "CLOSED";
  const canReply = isAdmin || !isResolvedOrClosed;

  const authorLabel = useMemo(() => {
    return user?.fullName || user?.email || "User";
  }, [user]);

  const technicianLabel = useMemo(() => {
    const raw = ticket?.technicianAssigned || "";
    if (raw.startsWith("{") && raw.endsWith("}")) {
      try {
        const parsed = JSON.parse(raw);
        return parsed.technician || raw;
      } catch {
        return raw;
      }
    }
    return raw;
  }, [ticket]);

  // ✅ LOAD DATA (FIXED)
  const loadData = async () => {
    try {
      setLoading(true);

      const ticketRes = await getTicketById(id);
      const commentRes = await getComments(id);
      const attachRes = await getAttachments(id);

      setTicket(ticketRes.data);
      setComments(commentRes.data);
      setAttachments(attachRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // ✅ ADD COMMENT (FIXED BODY)
  const handleAddComment = async () => {
    if (!canReply) return;
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      await addComment(id, authorLabel, newComment);
      setNewComment("");
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  // ✅ ASSIGN TECHNICIAN (FIXED)
  const handleAssign = async () => {
    if (!technician.trim()) return alert("Enter technician email");

    try {
      setAssigningTech(true);
      await assignTechnician(id, technician);
      setTechnician("");
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to assign technician");
    } finally {
      setAssigningTech(false);
    }
  };

  // ✅ UPDATE STATUS (FIXED DTO)
  const handleUpdate = async (status) => {
    try {
      setUpdatingStatus(true);
      await updateTicketStatus(id, {
        status: status,
        resolutionNotes: resolution,
      });

      setResolution("");
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to update ticket");
    } finally {
      setUpdatingStatus(false);
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

  const humanizeFromEmail = (email) => {
    if (!email || typeof email !== "string") return "";
    const localPart = email.split("@")[0] || "";
    return localPart
      .replace(/[._-]+/g, " ")
      .trim()
      .replace(/\b\w/g, (ch) => ch.toUpperCase());
  };

  const getIssuerName = (payload) => {
    const direct =
      payload?.createdByName ||
      payload?.userName ||
      payload?.issuedBy ||
      payload?.createdBy ||
      payload?.reportedBy ||
      payload?.requester;

    if (direct && String(direct).trim()) return String(direct).trim();

    const emailLike = payload?.createdByEmail || payload?.email;
    const inferred = humanizeFromEmail(emailLike);
    return inferred || emailLike || "Unknown User";
  };

  // 🔴 LOADING / ERROR
  if (loading) return <div className="page-block">Loading ticket...</div>;

  if (error || !ticket) {
    return (
      <div className="page-block">
        ❌ Ticket not found or API failed.
      </div>
    );
  }

  const statusStyle = getStatusStyles(ticket.status);
  const priorityStyle = getPriorityStyles(ticket.priority);

  return (
    <div
      style={{
        maxWidth: 1140,
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
        <button
          onClick={() => navigate(-1)}
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
          Back
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.02em" }}>{ticket.title}</h1>
            <p style={{ margin: "8px 0 0", color: "#475569" }}>Ticket #{ticket.id}</p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
            <span
              style={{
                background: statusStyle.background,
                color: statusStyle.color,
                borderRadius: 999,
                padding: "6px 12px",
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
                padding: "6px 12px",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {ticket.priority} PRIORITY
            </span>
          </div>
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
            <p style={{ marginTop: 0, color: "#334155", lineHeight: 1.6 }}>
              {ticket.description || "No description provided."}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 10,
              }}
            >
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                <strong>Category</strong>
                <div style={{ marginTop: 4, color: "#475569" }}>{ticket.category || "-"}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                <strong>Resource</strong>
                <div style={{ marginTop: 4, color: "#475569" }}>
                  {ticket.resourceName || "-"}
                  {ticket.resourceLocation ? ` (${ticket.resourceLocation})` : ""}
                </div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                <strong>Issued By</strong>
                <div style={{ marginTop: 4, color: "#475569" }}>{getIssuerName(ticket)}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                <strong>Created</strong>
                <div style={{ marginTop: 4, color: "#475569" }}>{formatCreatedAt(ticket.createdAt)}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                <strong>Technician</strong>
                <div style={{ marginTop: 4, color: "#475569" }}>{technicianLabel || "Not Assigned"}</div>
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
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <h3 style={{ margin: 0 }}>Comments</h3>
              <span style={{ color: "#64748b" }}>{comments.length} replies</span>
            </div>

            <div style={{ maxHeight: 320, overflow: "auto", marginTop: 12, marginBottom: 10, paddingRight: 4 }}>
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

            {!canReply && (
              <p style={{ margin: "0 0 10px", color: "#64748b" }}>
                Replies are disabled for resolved or closed tickets.
              </p>
            )}

            <label style={{ display: "block" }}>
              <span style={{ color: "#64748b", fontSize: 14 }}>Reply as {authorLabel}</span>
              <textarea
                placeholder="Write a reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                disabled={!canReply}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  padding: 10,
                  marginTop: 6,
                  resize: "vertical",
                }}
              />
            </label>

            <button
              onClick={handleAddComment}
              disabled={!canReply || submittingComment}
              style={{
                marginTop: 10,
                padding: "10px 14px",
                background: !canReply || submittingComment ? "#93c5fd" : "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 600,
                cursor: !canReply || submittingComment ? "not-allowed" : "pointer",
              }}
            >
              {submittingComment ? "Sending..." : "Send Reply"}
            </button>
          </article>
        </div>

        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          {isAdmin && (
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
              <div style={{ display: "grid", gap: 10 }}>
                <input
                  placeholder="Technician email"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    padding: "10px 12px",
                  }}
                />
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
                  {assigningTech ? "Assigning..." : "Assign"}
                </button>
              </div>
            </article>
          )}

          {canManageStatus && (
            <article
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                background: "#fff",
                padding: 16,
                boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
              }}
            >
              <h3 style={{ margin: "0 0 10px" }}>Technician Status Control</h3>
              <input
                placeholder="Resolution notes"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  padding: "10px 12px",
                  marginBottom: 10,
                }}
              />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => handleUpdate("IN_PROGRESS")}
                  disabled={updatingStatus}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    cursor: updatingStatus ? "not-allowed" : "pointer",
                  }}
                >
                  Start
                </button>
                <button
                  onClick={() => handleUpdate("RESOLVED")}
                  disabled={updatingStatus}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid #bbf7d0",
                    background: "#f0fdf4",
                    color: "#166534",
                    cursor: updatingStatus ? "not-allowed" : "pointer",
                  }}
                >
                  Resolve
                </button>
                <button
                  onClick={() => handleUpdate("CLOSED")}
                  disabled={updatingStatus}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid #fecaca",
                    background: "#fef2f2",
                    color: "#991b1b",
                    cursor: updatingStatus ? "not-allowed" : "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </article>
          )}

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
            {attachments.length === 0 && <p style={{ color: "#64748b", marginTop: 0 }}>No attachments uploaded.</p>}

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
                    style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }}
                  />
                </a>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}