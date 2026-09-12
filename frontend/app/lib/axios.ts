import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────────────────
//  In-Memory Access Token Storage (Security Best Practice)
// ─────────────────────────────────────────────────────────────────────────────
let accessTokenInMemory: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessTokenInMemory = token;
};

export const getAccessToken = (): string | null => {
  return accessTokenInMemory;
};

// ─────────────────────────────────────────────────────────────────────────────
//  Axios Custom Instance
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enables cross-site httpOnly cookies (accessToken & refreshToken)
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
//  Request Interceptor: Attach Bearer token if present in memory
// ─────────────────────────────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────────────────────
//  Response Interceptor: Handle Token Refresh & Request Queueing
// ─────────────────────────────────────────────────────────────────────────────
interface FailedQueueItem {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If no response or error is not 401 Unauthorized, reject immediately
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";

    // Avoid infinite refresh loop on auth endpoints
    const isAuthEndpoint =
      url.includes("/auth/signin") ||
      url.includes("/auth/refresh");


    if (isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Mark request as retried
    originalRequest._retry = true;

    // If another request is currently refreshing the token, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string | null) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          },
          reject: (err) => reject(err),
        });
      });
    }

    isRefreshing = true;

    try {
      // Call backend refresh endpoint (uses httpOnly refreshToken cookie)
      const refreshResponse = await api.post("/auth/refresh");
      const newAccessToken =
        refreshResponse.data?.data?.accessToken || null;

      setAccessToken(newAccessToken);
      processQueue(null, newAccessToken);

      if (newAccessToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      setAccessToken(null);

      // Dispatch logout event so AuthContext updates UI state
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }

      toast.error("Session expired. Please sign in again.");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
//  Global API Error Handler Helper for React Hot Toast
// ─────────────────────────────────────────────────────────────────────────────
export function handleApiError(
  error: unknown,
  fallbackMessage: string = "An error occurred. Please try again."
): string {
  let message = fallbackMessage;

  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (data?.message) {
      message = data.message;
    } else if (data?.errors) {
      // Extract field validation errors if formatted as object or array
      if (typeof data.errors === "object") {
        const firstErrorKey = Object.keys(data.errors)[0];
        const fieldError = data.errors[firstErrorKey];
        if (Array.isArray(fieldError)) {
          message = `${firstErrorKey}: ${fieldError[0]}`;
        } else if (typeof fieldError === "string") {
          message = fieldError;
        }
      }
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  toast.error(message);
  return message;
}
