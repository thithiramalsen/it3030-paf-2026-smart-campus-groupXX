import httpClient from "./httpClient";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dvohofunp";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "smart_campus_upload";

// ✅ CREATE TICKET
export const createTicket = (data) => {
  return httpClient.post("/api/tickets", data);
};

// ✅ GET ALL (ADMIN)
export const getAllTickets = () => {
  return httpClient.get("/api/tickets");
};

// ✅ GET MY TICKETS
export const getMyTickets = () => {
  return httpClient.get("/api/tickets/my");
};

// ✅ GET ASSIGNED (TECHNICIAN)
export const getAssignedTickets = () => {
  return httpClient.get("/api/tickets/assigned");
};

// ✅ GET ONE TICKET
export const getTicketById = (id) => {
  return httpClient.get(`/api/tickets/${id}`);
};

// ✅ UPDATE STATUS
export const updateTicketStatus = (id, payload) => {
  return httpClient.put(`/api/tickets/${id}/status`, payload);
};

// ✅ ASSIGN TECHNICIAN
export const assignTechnician = (id, technician) => {
  return httpClient.put(`/api/tickets/${id}/assign`, { technician });
};

// ✅ UPLOAD ATTACHMENT
export const uploadAttachment = async (ticketId, file) => {
  if (!file) {
    throw new Error("Attachment file is required");
  }

  const uploadToLegacyEndpoint = () => {
    const legacyFormData = new FormData();
    legacyFormData.append("file", file);
    return httpClient.post(`/api/attachments/${ticketId}`, legacyFormData);
  };

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  let cloudinaryData;
  try {
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!cloudinaryResponse.ok) {
      return uploadToLegacyEndpoint();
    }

    cloudinaryData = await cloudinaryResponse.json();
  } catch {
    return uploadToLegacyEndpoint();
  }

  try {
    return await httpClient.post(`/api/attachments/${ticketId}/external`, {
      fileUrl: cloudinaryData.secure_url,
      fileName: file.name,
      fileType: file.type || cloudinaryData.resource_type,
    });
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404 || status === 405) {
      return uploadToLegacyEndpoint();
    }
    throw error;
  }
};

// ✅ GET ATTACHMENTS
export const getAttachments = (ticketId) => {
  return httpClient.get(`/api/attachments/${ticketId}`);
};

// ✅ COMMENTS
export const getComments = (ticketId) => {
  return httpClient.get(`/api/comments/${ticketId}`);
};

export const addComment = (ticketId, author, message) => {
  return httpClient.post(`/api/comments/${ticketId}`, {
    author,
    message,
  });

};

export const deleteTicket = (id) => {
  return httpClient.delete(`/api/tickets/${id}`);
};
