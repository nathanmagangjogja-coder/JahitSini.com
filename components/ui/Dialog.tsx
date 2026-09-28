"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type DialogProps = {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<DialogProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
}: DialogProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previousFocus = React.useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (!open) return;

    previousFocus.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables && focusables.length > 0) {
        focusables[0].focus();
      } else {
        dialogRef.current?.focus();
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previousFocus.current?.focus?.();
    };
  }, [open, onOpenChange]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-brand-text/40 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "dialog-title" : undefined}
        aria-describedby={description ? "dialog-description" : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full rounded-2xl border border-brand-border bg-white shadow-card",
          "flex flex-col max-h-[calc(100vh-2rem)]",
          sizeClasses[size]
        )}
      >
        {(title || description) && (
          <div className="flex shrink-0 flex-col gap-1.5 p-6 border-b border-brand-border">
            {title && (
              <h2 id="dialog-title" className="text-xl font-bold leading-tight tracking-tight text-brand-text">
                {title}
              </h2>
            )}
            {description && (
              <p id="dialog-description" className="text-sm text-slate-500 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        <div className={cn(
          "flex-1 overflow-y-auto p-6",
          "max-h-[80vh] md:max-h-none"
        )}>
          {children}
        </div>
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-2 p-6 border-t border-brand-border">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
