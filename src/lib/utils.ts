
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface DeleteDialogOptions {
  title: string;
  description: string;
  onConfirm: () => void;
}

export function deleteJobDialog(options: DeleteDialogOptions) {
  if (window.confirm(`${options.title}\n\n${options.description}`)) {
    options.onConfirm();
  }
}

/**
 * Match score color temperature: green (≥80) → yellow (≥60) → orange (≥40) → red (<40)
 * Returns a solid Tailwind bg class for use with text-white badges and progress bars.
 */
export function getMatchScoreBgClass(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

/**
 * Returns light badge Tailwind classes (bg + text + border) for match score badges
 * on light backgrounds (e.g., employer tables and dialogs).
 */
export function getMatchScoreLightClass(score: number): string {
  if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
  if (score >= 60) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (score >= 40) return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-red-100 text-red-700 border-red-200";
}
