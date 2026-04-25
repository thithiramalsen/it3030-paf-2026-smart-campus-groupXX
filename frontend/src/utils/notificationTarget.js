const TICKET_ID_REGEX = /ticket\s*#\s*(\d+)/i;

function isAdmin(role) {
  return (role || '').toUpperCase() === 'ADMIN';
}

function extractTicketId(notification) {
  const candidates = [notification?.message, notification?.title];

  for (const value of candidates) {
    if (!value || typeof value !== 'string') continue;
    const match = value.match(TICKET_ID_REGEX);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

function ticketTarget(notification, role) {
  const ticketId = extractTicketId(notification);
  if (ticketId) {
    return isAdmin(role) ? `/admin/tickets/${ticketId}` : `/tickets/${ticketId}`;
  }

  return isAdmin(role) ? '/admin/tickets' : '/tickets/my';
}

export function getNotificationTarget(notification, role) {
  if (!notification?.type) {
    return '/notifications';
  }

  switch (notification.type) {
    case 'BOOKING_CREATED':
      return isAdmin(role) ? '/admin/bookings' : '/bookings/my';
    case 'BOOKING_APPROVED':
    case 'BOOKING_REJECTED':
      return '/bookings/my';
    case 'TICKET_UPDATED':
    case 'COMMENT_ADDED':
      return ticketTarget(notification, role);
    case 'ACCOUNT_APPROVAL_REQUIRED':
      return isAdmin(role) ? '/admin/users' : '/notifications';
    default:
      return '/notifications';
  }
}
