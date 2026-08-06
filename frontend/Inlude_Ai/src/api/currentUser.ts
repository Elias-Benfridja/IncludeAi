export function getCurrentUserId(): number | null {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.user_id === "number" ? decoded.user_id : null;
  } catch {
    return null;
  }
}