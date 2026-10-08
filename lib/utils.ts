import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// getBusinessConfig() dipindah ke lib/settings.ts sebagai getBusinessSettingsRemote(),
// yang membaca dari Supabase (bisa diedit admin) dengan fallback ke env var yang sama.