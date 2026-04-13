"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Settings, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";

interface NetworkStatusProps {
  isOffline?: boolean;
  onRetry?: () => void;
}

export function NetworkStatus({
  isOffline: propOffline,
  onRetry,
}: NetworkStatusProps) {
  const [isOffline, setIsOffline] = useState(propOffline ?? false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (propOffline !== undefined) {
      setIsOffline(propOffline);
      setShowBanner(propOffline);
      return;
    }

    const handleOnline = () => {
      setIsOffline(false);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowBanner(true);
    };

    setIsOffline(!navigator.onLine);
    setShowBanner(!navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [propOffline]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-yellow-950"
        >
          <div className="px-4 py-2 flex items-center justify-center gap-3">
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              Sin conexión a internet. Algunos datos pueden no estar
              actualizados.
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              className="h-7 px-2 text-yellow-800 hover:bg-yellow-400/20"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reintentar
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface OfflineFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function OfflineFallback({
  title = "Sin conexión",
  message = "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
  onRetry,
}: OfflineFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6"
        >
          <WifiOff className="w-10 h-10 text-yellow-600 dark:text-yellow-500" />
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{message}</p>

        <div className="flex gap-3 justify-center">
          <Button
            variant="secondary"
            onClick={onRetry || (() => window.location.reload())}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/dashboard")}
          >
            <Settings className="w-4 h-4 mr-2" />
            Ir al Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
