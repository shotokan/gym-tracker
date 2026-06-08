import axios from "axios";

// Base URL comes from the VITE_API_URL environment variable.
// Set in .env.local for development and in Vercel dashboard for production.
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT token to every request if one exists in session storage.
client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear the token and redirect to login — BUT only for protected routes.
// A 401 on /auth/login means wrong credentials, not an expired session,
// so we let the login handler show the error without redirecting.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRequest = err.config?.url?.includes("/auth/");
    if (err.response?.status === 401 && !isAuthRequest) {
      sessionStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(err);
  },
);
