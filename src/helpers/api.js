export const fetchWithAuth = async (url, options = {}) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  let accessToken = localStorage.getItem("accessToken");

  if (!options.headers) options.headers = {};
  options.headers["Authorization"] = `Bearer ${accessToken}`;

  let response = await fetch(url, options);

  if (response.status === 401 || response.status === 403) {
    const refreshToken = localStorage.getItem("refreshToken");
    const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refreshToken })
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      localStorage.setItem("accessToken", data.accessToken);

      options.headers["Authorization"] = `Bearer ${data.accessToken}`;
      response = await fetch(url, options);
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
  }

  return response;
};