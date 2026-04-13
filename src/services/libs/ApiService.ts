import type { AxiosError, AxiosRequestConfig } from "axios";
import { baseApi } from "./BaseApi";

export interface ApiError extends Error {
  status?: number;
  statusCode?: number;
  isNetworkError?: boolean;
  isRateLimited?: boolean;
  originalMessage?: string;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("isNetworkError" in error || "isRateLimited" in error || "status" in error)
  );
}

export class ApiService {
  private static handleError(error: unknown): never {
    const axiosError = error as AxiosError<{ message?: string }>;
    const errorMessage = axiosError.message || "";

    if (axiosError.response) {
      const customError = new Error(
        axiosError.response.data?.message ?? "Error del servidor",
      ) as ApiError;
      customError.status = axiosError.response.status;
      customError.statusCode = axiosError.response.status;
      customError.originalMessage = axiosError.response.data?.message;

      if (
        axiosError.response.status === 429 ||
        axiosError.response.data?.message?.includes("Too Many Requests")
      ) {
        customError.isRateLimited = true;
      }
      throw customError;
    }

    if (axiosError.request) {
      const networkError = new Error(
        "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
      ) as ApiError;
      networkError.isNetworkError = true;
      networkError.originalMessage = errorMessage;
      throw networkError;
    }

    const configError = new Error(
      errorMessage || "Error inesperado. Intenta de nuevo más tarde.",
    ) as ApiError;
    if (
      errorMessage.includes("Too Many Requests") ||
      errorMessage.includes("429") ||
      errorMessage.includes("ThrottlerException")
    ) {
      configError.isRateLimited = true;
      configError.originalMessage = errorMessage;
    }
    throw configError;
  }

  static async get<T>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await baseApi.get<T>(endpoint, config);
      return response.data;
    } catch (error) {
      ApiService.handleError(error);
    }
  }

  static async post<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await baseApi.post<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      ApiService.handleError(error);
    }
  }

  static async put<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await baseApi.put<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      ApiService.handleError(error);
    }
  }

  static async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await baseApi.patch<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      ApiService.handleError(error);
    }
  }

  static async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await baseApi.delete<T>(endpoint, config);
      return response.data;
    } catch (error) {
      ApiService.handleError(error);
    }
  }
}
