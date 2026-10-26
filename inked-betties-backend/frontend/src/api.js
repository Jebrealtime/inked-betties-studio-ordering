export const API_BASE_URL = "https://inked-betties-studio-ordering.onrender.com";

// ⭐ The logged-in account (saved by App.jsx at login/register), or null.
export function currentUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}
