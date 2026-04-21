import axios from "axios";
import Cookies from "js-cookie";
import { API_URLS } from "@/services/libs/ApiConfig";

interface ImportPayload {
  fileName: string;
  records: Array<{
    amount: number;
    category: string;
    description?: string;
    date: string;
  }>;
}

export interface ImportResult {
  message: string;
  imported: number;
  failed: number;
  s3Key: string;
}

export interface ExportResult {
  message: string;
  format: "json" | "csv";
  count: number;
  s3Key: string;
  downloadUrl: string;
}

const dataTransferApi = axios.create({
  baseURL: API_URLS.ImportExport,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

dataTransferApi.interceptors.request.use((config) => {
  const token = Cookies.get("jwt");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class DataTransferService {
  static async exportData(format: "json" | "csv"): Promise<ExportResult> {
    const response = await dataTransferApi.get<ExportResult>("/export", {
      params: { format },
    });
    return response.data;
  }

  static async importData(payload: ImportPayload): Promise<ImportResult> {
    const response = await dataTransferApi.post<ImportResult>("/import", payload);
    return response.data;
  }
}
