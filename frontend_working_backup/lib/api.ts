import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("tbi_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("tbi_access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth helpers
export const authApi = {
  login: async (email: string, password: string) => {
    const form = new FormData();
    form.append("username", email);
    form.append("password", password);
    const res = await api.post("/api/v1/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.data;
  },
  verifyMFA: async (tempToken: string, totpCode: string) => {
    const res = await api.post("/api/v1/auth/mfa/verify", {
      temp_token: tempToken,
      totp_code: totpCode,
    });
    return res.data;
  },
  me: async () => {
    const res = await api.get("/api/v1/auth/me");
    return res.data;
  },
};