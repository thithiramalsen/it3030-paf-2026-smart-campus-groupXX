import httpClient from './httpClient';

const BASE = '/api/bookings';

export const bookingApi = {

  // Create a new booking request
  createBooking(data) {
    return httpClient.post(BASE, data);
  },

  // Get logged-in user's own bookings
  getMyBookings() {
    return httpClient.get(`${BASE}/my`);
  },

  // Get all bookings - admin only, optional status filter
  getAllBookings(status) {
    return httpClient.get(BASE, { params: status ? { status } : {} });
  },

  // Get a single booking by ID
  getBookingById(id) {
    return httpClient.get(`${BASE}/${id}`);
  },

  // Approve a booking - admin only
  approveBooking(id, note) {
    return httpClient.put(`${BASE}/${id}/approve`, { note });
  },

  // Reject a booking - admin only
  rejectBooking(id, note) {
    return httpClient.put(`${BASE}/${id}/reject`, { note });
  },

  // Cancel a booking
  cancelBooking(id, note) {
    return httpClient.put(`${BASE}/${id}/cancel`, { note });
  },

  // Smart Slot Suggester - get 3 available slots
  suggestSlots(resourceId, date, durationMinutes = 60) {
    return httpClient.get(`${BASE}/suggest-slots`, {
      params: { resourceId, date, durationMinutes },
    });
  },

  // Get busy hours for heatmap
  getBusyHours(resourceId, days = 14) {
    return httpClient.get(`${BASE}/busy-hours`, { params: { resourceId, days } });
  },

    // Get daily schedule for a specific date
  getDailySchedule(resourceId, date) {
    return httpClient.get(`${BASE}/daily-schedule`, { params: { resourceId, date } });
  },

    // Get schedule matrix for table heatmap view
  getScheduleMatrix(resourceId, days = 14) {
    return httpClient.get(`${BASE}/schedule-matrix`, { params: { resourceId, days } });
  },

};