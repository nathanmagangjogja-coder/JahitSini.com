"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({ children, className }: AccordionProps) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-brand-border bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-brand-bg/50"
      >
        <span className="text-sm sm:text-base font-semibold text-brand-text">{title}</span>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center shrink-0 rounded-full text-brand-green transition-transform",
            open ? "rotate-45 bg-brand-bg" : "bg-brand-bg/60"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-slate-600 leading-relaxed">{children}</p>
        </div>
      )}
    </div>
  );
}
