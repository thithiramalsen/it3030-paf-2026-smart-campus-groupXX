const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");

const HTTP_URL_PATTERN = /^https?:\/\//i;
const WINDOWS_PATH_PATTERN = /^[A-Za-z]:[\\/]/;
const UNIX_ABSOLUTE_PATH_PATTERN = /^\//;

const encodePathSegments = (pathValue) => {
  const cleaned = pathValue.replace(/\\/g, "/").replace(/^\/+/, "").trim();
  if (!cleaned) return "";

  const encodedSegments = cleaned
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment));

  return `/${encodedSegments.join("/")}`;
};

export const resolveTicketAttachmentUrl = (attachment) => {
  if (!attachment) return "";

  const attachmentId = attachment.id;
  const rawPath = typeof attachment.filePath === "string" ? attachment.filePath.trim() : "";
  const rawFileName = typeof attachment.fileName === "string" ? attachment.fileName.trim() : "";

  if (rawPath && HTTP_URL_PATTERN.test(rawPath)) {
    return rawPath;
  }

  // For legacy local files, a backend id-based endpoint is the most stable path.
  if (attachmentId != null) {
    return `${API_BASE}/api/attachments/file/${encodeURIComponent(String(attachmentId))}`;
  }

  if (rawPath && !WINDOWS_PATH_PATTERN.test(rawPath) && !UNIX_ABSOLUTE_PATH_PATTERN.test(rawPath)) {
    let relativePath = rawPath;

    if (!relativePath.startsWith("/") && !relativePath.startsWith("uploads/")) {
      relativePath = `uploads/${relativePath}`;
    }

    const encodedPath = encodePathSegments(relativePath);
    if (encodedPath) {
      return `${API_BASE}${encodedPath}`;
    }
  }

  if (rawFileName) {
    return `${API_BASE}/uploads/${encodeURIComponent(rawFileName)}`;
  }

  return "";
};

export const isTicketAttachmentImage = (attachment) => {
  const fileType = typeof attachment?.fileType === "string" ? attachment.fileType.toLowerCase() : "";
  if (fileType.startsWith("image/")) {
    return true;
  }

  const fileName = typeof attachment?.fileName === "string" ? attachment.fileName : "";
  return /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/i.test(fileName);
};
