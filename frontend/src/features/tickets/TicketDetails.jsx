import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getTicketById,
  getComments,
  getAttachments,
  addComment,
  assignTechnician,
  updateTicketStatus
} from "../../api/ticketsApi"; // ✅ use API

export default function TicketDetails() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [newComment, setNewComment] = useState("");
  const [technician, setTechnician] = useState("");
  const [resolution, setResolution] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      await addComment(id, newComment); // ✅ correct body
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
  if (loading) return <p style={{ padding: 20 }}>Loading ticket...</p>;

  if (error || !ticket) {
    return (
      <div style={{ padding: 20 }}>
        ❌ Ticket not found or API failed <br />
        Check backend / console
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <h2>🎫 Ticket Details</h2>

      {/* INFO */}
      <div style={{
        border: "1px solid #ddd",
        padding: 16,
        borderRadius: 10,
        background: "#fff"
      }}>
        <h3>{ticket.title}</h3>
        <p>{ticket.description}</p>

        <p><strong>Status:</strong> {ticket.status}</p>
        <p><strong>Priority:</strong> {ticket.priority}</p>
        <p><strong>Category:</strong> {ticket.category}</p>
        <p><strong>Location:</strong> {ticket.location}</p>

        <p><strong>Technician:</strong> {ticket.technicianAssigned || "Not Assigned"}</p>
        <p><strong>Resolution:</strong> {ticket.resolutionNotes || "Not resolved yet"}</p>
      </div>

      {/* ADMIN */}
      <div style={{ marginTop: 20 }}>
        <h3>🛠 Admin Actions</h3>

        <div style={{ marginBottom: 10 }}>
          <input
            placeholder="Technician name"
            value={technician}
            onChange={(e) => setTechnician(e.target.value)}
            style={{ padding: 6, marginRight: 6 }}
          />
          <button onClick={handleAssign}>Assign</button>
        </div>

        <div>
          <input
            placeholder="Resolution notes"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            style={{ padding: 6 }}
          />

          <div style={{ marginTop: 6 }}>
            <button onClick={() => handleUpdate("IN_PROGRESS")}>Start</button>
            <button onClick={() => handleUpdate("RESOLVED")}>Resolve</button>
            <button onClick={() => handleUpdate("CLOSED")}>Close</button>
          </div>
        </div>
      </div>

      {/* ATTACHMENTS */}
      <div style={{ marginTop: 20 }}>
        <h3>📎 Attachments</h3>

        {attachments.length === 0 && <p>No attachments</p>}

        {attachments.map((a) => (
          <div key={a.id}>
            <a
              href={`http://localhost:8080/${a.filePath}`}
              target="_blank"
              rel="noreferrer"
            >
              {a.fileName}
            </a>
          </div>
        ))}
      </div>

      {/* COMMENTS */}
      <div style={{ marginTop: 20 }}>
        <h3>💬 Comments</h3>

        {comments.map((c) => (
          <div key={c.id} style={{
            borderBottom: "1px solid #eee",
            padding: 8
          }}>
            <strong>{c.author}</strong>: {c.message}
          </div>
        ))}

        <div style={{ marginTop: 10 }}>
          <input
            placeholder="Write comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ padding: 6, marginRight: 6 }}
          />
          <button onClick={handleAddComment}>Send</button>
        </div>
      </div>
    </div>
  );
}