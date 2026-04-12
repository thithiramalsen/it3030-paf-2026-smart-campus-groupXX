import { useState } from "react";
import { createTicket, uploadAttachment } from "../../api/ticketsApi"; // ✅ changed

const CATEGORY_OPTIONS = ["ELECTRICAL", "NETWORK", "HARDWARE", "SOFTWARE"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];
const LOCATION_OPTIONS = [ 
    "LAB_1",
    "LAB_2",
    "LAB_B",
    "LECTURE_HALL_A",
    "LECTURE_HALL_B",
    "LIBRARY",
    "CAFETERIA" ];

export default function NewTicket() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    location: "",
  });

  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // ✅ FIXED SUBMIT (uses API + token automatically)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 🔥 CREATE TICKET
      const res = await createTicket({
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
        location: form.location,
      });

      const ticketId = res.data.id;

      // 🔥 UPLOAD FILE
      if (file) {
        await uploadAttachment(ticketId, file);
      }

      setSuccess(true);

      setForm({
        title: "",
        description: "",
        category: "",
        priority: "",
        location: "",
      });

      setFile(null);

    } catch (err) {
      console.error("ERROR:", err.response || err);
      setError("Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 600,
      margin: "40px auto",
      padding: 20,
      borderRadius: 12,
      background: "#ffffff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ marginBottom: 20 }}>🎫 Create Incident Ticket</h2>

      <form onSubmit={handleSubmit}>

        {/* Title */}
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Describe the issue..."
          value={form.description}
          onChange={handleChange}
          required
          rows={4}
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />

        {/* Category */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        >
          <option value="">Select Category</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* Priority */}
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        >
          <option value="">Select Priority</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        {/* Location */}
        <select
          name="location"
          value={form.location}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        >
          <option value="">Select Location</option>
          {LOCATION_OPTIONS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>

        {/* File Upload */}
        <input
          type="file"
          onChange={handleFileChange}
          style={{ marginBottom: 12 }}
        />

        {/* Messages */}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>Ticket created successfully!</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>

      </form>
    </div>
  );
}