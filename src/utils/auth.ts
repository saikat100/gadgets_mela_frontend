export function getToken() {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  }
  export function getUser() {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return null; }
  }
  export function logout() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }