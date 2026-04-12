import httpClient from "./httpClient";

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
export const uploadAttachment = (ticketId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return httpClient.post(`/api/attachments/${ticketId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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
