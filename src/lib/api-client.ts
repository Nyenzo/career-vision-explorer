// src/lib/api-client.ts
import { API_CONFIG } from "../config/api.config";

// API Client configuration for FastAPI backend
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = localStorage.getItem("access_token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem("access_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    config?: { timeoutMs?: number; signal?: AbortSignal }
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    const timeoutMs = config?.timeoutMs || API_CONFIG.TIMEOUTS.DEFAULT;

    // Create headers as a Record<string, string>
    const headers: Record<string, string> = {};

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Merge with any existing headers from options
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        // Handle array of tuples
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else if (typeof options.headers === "object") {
        // Handle Record<string, string>
        Object.assign(headers, options.headers);
      }
    }

    // Reduced logging - only log in development
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_API === "true") {
      console.log(`🌐 ${options.method || "GET"} ${endpoint}`);
    }

    let controller: AbortController | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let signal = config?.signal;

    if (!signal) {
      controller = new AbortController();
      signal = controller.signal;
      timeoutId = setTimeout(() => controller!.abort(), timeoutMs);
    }

    const requestConfig: RequestInit = {
      headers,
      signal,
      ...options,
    };

    try {
      const startTime = performance.now();
      const response = await fetch(url, requestConfig);
      const endTime = performance.now();

      // Reduced logging
      if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_API === "true") {
        console.log(
          `📡 ${response.status} ${endpoint} (${Math.round(endTime - startTime)}ms)`
        );
      }

      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: any = null;
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const text = await response.text();
          
          if (import.meta.env.DEV) {
            console.error(`❌ ${response.status} ${endpoint}:`, text);
          }

          if (text) {
            try {
              errorData = JSON.parse(text);
              errorMessage = errorData.detail || errorData.message || text;
            } catch {
              errorMessage = text;
            }
          }
        } catch (e) {
          if (import.meta.env.DEV) {
            console.error("Failed to read error response:", e);
          }
        }

        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).response = errorData;
        throw error;
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data;
      }

      const text = await response.text();
      return text as unknown as T;
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        if (import.meta.env.DEV) {
          console.error(`⏰ Timeout: ${endpoint} (${timeoutMs}ms)`);
        }
        throw new Error(`Request timed out after ${timeoutMs / 1000} seconds`);
      }

      if (import.meta.env.DEV) {
        console.error(`❌ ${endpoint}`, error.message);
      }
      throw error;
    }
  }

  async get<T>(
    endpoint: string,
    config?: { timeout?: number; signal?: AbortSignal }
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      { method: "GET" },
      { timeoutMs: config?.timeout, signal: config?.signal }
    );
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: { signal?: AbortSignal }
  ): Promise<T> {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : data ? JSON.stringify(data) : undefined;

    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body,
      },
      { signal: config?.signal }
    );
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName: string = "file"
  ): Promise<T> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append(fieldName, file);

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log(`📤 Uploading file:`, file.name, file.size);

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || errorData.message || `HTTP ${response.status}`
      );
    }

    return await response.json();
  }

  // Fast get for critical data
  async getFast<T>(
    endpoint: string,
    config?: { signal?: AbortSignal }
  ): Promise<T> {
    return this.get<T>(endpoint, {
      timeout: API_CONFIG.TIMEOUTS.FAST,
      signal: config?.signal,
    });
  }
}

export const apiClient = new ApiClient();
