"use client";

import { Download, FileUp, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/context/ToastContext";
import {
  DataTransferService,
  type ExportResult,
  type ImportResult,
} from "@/services/data-transfer/DataTransferService";

type ParsedRecord = {
  amount: number;
  category: string;
  description: string;
  date: string;
};

function normalizeRecords(raw: unknown): ParsedRecord[] {
  if (!Array.isArray(raw)) {
    throw new Error("El JSON debe ser un arreglo de gastos");
  }

  const normalized = raw
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const amount = Number((item as Record<string, unknown>).amount);
      const category = String((item as Record<string, unknown>).category ?? "").trim();
      const description = String(
        (item as Record<string, unknown>).description ?? "",
      ).trim();
      const rawDate = String((item as Record<string, unknown>).date ?? "").trim();

      if (!Number.isFinite(amount) || amount < 0) return null;
      if (!category) return null;
      if (!rawDate) return null;

      const parsedDate = new Date(rawDate);
      if (Number.isNaN(parsedDate.getTime())) return null;

      const isoDate = parsedDate.toISOString();

      return {
        amount,
        category,
        description,
        date: isoDate,
      };
    })
    .filter((value): value is ParsedRecord => value !== null);

  if (normalized.length === 0) {
    throw new Error("No se encontraron registros validos para importar");
  }

  return normalized;
}

export default function DataTransferPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [lastImportResult, setLastImportResult] = useState<ImportResult | null>(null);
  const [lastExportResult, setLastExportResult] = useState<ExportResult | null>(null);

  const { addToast } = useToast();

  const fileLabel = useMemo(() => {
    if (!selectedFile) return "No hay archivo seleccionado";
    return `${selectedFile.name} (${Math.ceil(selectedFile.size / 1024)} KB)`;
  }, [selectedFile]);

  const handleImport = async () => {
    if (!selectedFile) {
      addToast("Selecciona un archivo JSON primero", "warning");
      return;
    }

    setImporting(true);
    setLastImportResult(null);

    try {
      const fileText = await selectedFile.text();
      const parsed = JSON.parse(fileText);
      const records = normalizeRecords(parsed);

      const result = await DataTransferService.importData({
        fileName: selectedFile.name,
        records,
      });

      setLastImportResult(result);
      addToast("Importacion completada", "success");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || "Error al importar datos";
      addToast(message, "error");
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (format: "json" | "csv") => {
    if (format === "json") {
      setExportingJson(true);
    } else {
      setExportingCsv(true);
    }
    setLastExportResult(null);

    try {
      const result = await DataTransferService.exportData(format);
      setLastExportResult(result);
      window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
      addToast(`Exportacion ${format.toUpperCase()} generada`, "success");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Error al exportar datos";
      addToast(message, "error");
    } finally {
      if (format === "json") {
        setExportingJson(false);
      } else {
        setExportingCsv(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Importar y Exportar"
        subtitle="Gestiona respaldos de tus gastos mediante Lambda + API Gateway"
      />

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Exportar datos</h2>
        <p className="text-sm text-muted-foreground">
          Genera un archivo con tus gastos y descargalo desde S3 con enlace temporal.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => handleExport("json")}
            loading={exportingJson}
            disabled={exportingCsv}
            className="gap-2"
          >
            {exportingJson ? <Loader2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            Exportar JSON
          </Button>

          <Button
            variant="secondary"
            onClick={() => handleExport("csv")}
            loading={exportingCsv}
            disabled={exportingJson}
            className="gap-2"
          >
            {exportingCsv ? <Loader2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            Exportar CSV
          </Button>
        </div>

        {lastExportResult && (
          <div className="rounded-lg border border-border p-3 text-sm">
            <p className="font-medium">Ultima exportacion</p>
            <p>Formato: {lastExportResult.format.toUpperCase()}</p>
            <p>Registros: {lastExportResult.count}</p>
            <p className="break-all text-xs text-muted-foreground">S3 Key: {lastExportResult.s3Key}</p>
          </div>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Importar datos</h2>
        <p className="text-sm text-muted-foreground">
          Sube un archivo JSON con arreglo de gastos. Ejemplo por item: amount, category, description, date.
        </p>

        <div className="space-y-2">
          <input
            type="file"
            accept="application/json,.json"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-4 file:rounded-lg file:border file:border-border file:bg-muted file:px-3 file:py-2"
          />
          <p className="text-xs text-muted-foreground">{fileLabel}</p>
        </div>

        <Button onClick={handleImport} loading={importing} disabled={!selectedFile} className="gap-2">
          <FileUp className="w-4 h-4" />
          Importar JSON
        </Button>

        {lastImportResult && (
          <div className="rounded-lg border border-border p-3 text-sm">
            <p className="font-medium">Ultima importacion</p>
            <p>Importados: {lastImportResult.imported}</p>
            <p>Fallidos: {lastImportResult.failed}</p>
            <p className="break-all text-xs text-muted-foreground">S3 Key: {lastImportResult.s3Key}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
