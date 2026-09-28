import { OrderStatus, statusLabels, statusTimeline } from "@/lib/data";
import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  size?: "sm" | "md";
}

export function OrderTimeline({ currentStatus, size = "md" }: OrderTimelineProps) {
  const currentIndex = statusTimeline.indexOf(currentStatus);

  return (
    <ol
      className={cn(
        "w-full",
        size === "md" ? "space-y-4" : "space-y-3"
      )}
    >
      {statusTimeline.map((status, idx) => {
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const meta = statusLabels[status];
        return (
          <li key={status} className="relative flex items-start gap-4">
            {idx < statusTimeline.length - 1 && (
              <div
                className={cn(
                  "absolute left-[19px] top-10 w-0.5 h-full -translate-y-1/2",
                  size === "md" ? "h-12" : "h-10",
                  isCompleted ? "bg-brand-green/60" : "bg-brand-border"
                )}
              />
            )}
            <div
              className={cn(
                "relative z-10 flex items-center justify-center shrink-0 rounded-full ring-4 ring-white shadow-soft transition",
                size === "md" ? "h-10 w-10" : "h-9 w-9",
                isCompleted
                  ? "bg-brand-green text-white"
                  : isCurrent
                  ? "bg-gradient-to-br from-brand-green to-emerald-400 text-white ring-brand-green/20"
                  : "bg-white text-slate-400 border-2 border-brand-border"
              )}
            >
              {isCompleted ? (
                <Check className={size === "md" ? "h-5 w-5" : "h-4 w-4"} />
              ) : (
                <Clock className={size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"} />
              )}
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p
                  className={cn(
                    "font-semibold",
                    isCompleted || isCurrent ? "text-brand-text" : "text-slate-400",
                    size === "md" ? "text-sm" : "text-xs"
                  )}
                >
                  {meta.label}
                </p>
                {isCurrent && (
                  <span className="inline-flex items-center rounded-full bg-green-50 text-[11px] font-medium text-brand-green-dark px-2 py-0.5 border border-green-200">
                    Saat ini
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
