import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [newComment, setNewComment] = useState("");
  const [technician, setTechnician] = useState("");
  const [resolution, setResolution] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const role = user?.role || "USER";
  const isAdmin = role === "ADMIN";
  const isTechnician = role === "TECHNICIAN";
  const canManageStatus = isAdmin || isTechnician;

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
    if (!newComment) return;

    try {
      await addComment(id, authorLabel, newComment);
      setNewComment("");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to add comment");
    }
  };

  // ✅ ASSIGN TECHNICIAN (FIXED)
  const handleAssign = async () => {
    if (!technician) return alert("Enter technician name");

    try {
      await assignTechnician(id, technician);
      setTechnician("");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to assign technician");
    }
  };

  // ✅ UPDATE STATUS (FIXED DTO)
  const handleUpdate = async (status) => {
    try {
      await updateTicketStatus(id, {
        status: status,
        resolutionNotes: resolution,
      });

      setResolution("");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to update ticket");
    }
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

  return (
    <div className="page-block">
      <div className="inline-actions spread">
        <h1>Ticket Details</h1>
        <span className="muted">#{ticket.id}</span>
      </div>

      <section className="card">
        <h2>{ticket.title}</h2>
        <p className="muted">{ticket.description}</p>

        <div className="card-grid four">
          <div>
            <p className="muted">Status</p>
            <strong>{ticket.status}</strong>
          </div>
          <div>
            <p className="muted">Priority</p>
            <strong>{ticket.priority}</strong>
          </div>
          <div>
            <p className="muted">Category</p>
            <strong>{ticket.category}</strong>
          </div>
          <div>
            <p className="muted">Location</p>
            <strong>{ticket.location}</strong>
          </div>
        </div>

        <div className="inline-actions">
          <span><strong>Technician:</strong> {technicianLabel || "Not Assigned"}</span>
          <span><strong>Resolution:</strong> {ticket.resolutionNotes || "Not resolved yet"}</span>
        </div>
      </section>

      {isAdmin && (
        <section className="card">
          <h3>Assign Technician</h3>
          <div className="inline-actions">
            <input
              placeholder="Technician email"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
            />
            <button className="btn-primary" onClick={handleAssign}>Assign</button>
          </div>
        </section>
      )}

      {canManageStatus && (
        <section className="card">
          <h3>Update Status</h3>
          <input
            placeholder="Resolution notes"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
          />
          <div className="inline-actions">
            <button className="btn-outline" onClick={() => handleUpdate("IN_PROGRESS")}>Start</button>
            <button className="btn-outline" onClick={() => handleUpdate("RESOLVED")}>Resolve</button>
            <button className="btn-danger" onClick={() => handleUpdate("CLOSED")}>Close</button>
          </div>
        </section>
      )}

      <section className="card">
        <h3>Attachments</h3>
        {attachments.length === 0 && <p className="muted">No attachments uploaded.</p>}
        {attachments.map((a) => (
          <a
            key={a.id}
            href={`http://localhost:8080/${a.filePath}`}
            target="_blank"
            rel="noreferrer"
          >
            {a.fileName}
          </a>
        ))}
      </section>

      <section className="card">
        <div className="inline-actions spread">
          <h3>Comments</h3>
          <span className="muted">{comments.length} replies</span>
        </div>

        {comments.length === 0 && <p className="muted">No comments yet.</p>}

        <div className="stack-list">
          {comments.map((c) => (
            <div key={c.id} className="card">
              <strong>{c.author}</strong>
              <p>{c.message}</p>
            </div>
          ))}
        </div>

        <div className="form-grid">
          <label>
            <span className="muted">Reply as {authorLabel}</span>
            <textarea
              placeholder="Write a reply..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
          </label>
          <button className="btn-primary" onClick={handleAddComment}>Send Reply</button>
        </div>
      </section>
    </div>
  );
}