
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
