"use client";

import * as React from "react";
import { MapPin, RefreshCw } from "lucide-react";

type State =
  | { status: "loading" }
  | { status: "ready"; lat: number; lng: number }
  | { status: "empty" }
  | { status: "error"; message: string };
export function WorkshopMap({ className = "" }: { className?: string }) {
  const [state, setState] = React.useState<State>({ status: "loading" });

  const load = React.useCallback(() => {
    setState({ status: "loading" });
    fetch("/api/workshop-location", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (typeof json?.lat === "number" && typeof json?.lng === "number") {
          setState({ status: "ready", lat: json.lat, lng: json.lng });
        } else {
          setState({ status: "empty" });
        }
      })
      .catch(() => setState({ status: "error", message: "Gagal memuat peta." }));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (state.status === "ready") {
    return (
      <iframe
        title="Lokasi Workshop Jahitsini.com"
        src={`https://www.google.com/maps?q=${state.lat},${state.lng}&z=16&output=embed`}
        className={`w-full h-full border-0 ${className}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <div className={`w-full h-full flex items-center justify-center text-center px-6 ${className}`}>
      {state.status === "loading" && <p className="text-xs text-slate-400">Memuat peta...</p>}
      {state.status === "empty" && (
        <div>
          <MapPin className="h-8 w-8 text-brand-green mx-auto mb-2" />
          <p className="text-xs text-slate-500">Lokasi peta belum diatur admin.</p>
        </div>
      )}
      {state.status === "error" && (
        <div>
          <p className="text-xs text-red-500 mb-2">{state.message}</p>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 text-xs text-brand-green hover:underline"
          >
            <RefreshCw className="h-3 w-3" />
            Coba lagi
          </button>
        </div>
      )}
    </div>
  );
}
