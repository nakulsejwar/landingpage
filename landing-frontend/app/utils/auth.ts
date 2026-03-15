export function isLoggedIn() {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("token");

  if (!token || token === "undefined" || token === "null") {
    return false;
  }

  return true;
}