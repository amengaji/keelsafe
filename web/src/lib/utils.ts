// web/src/lib/utils.ts

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility to merge Tailwind classes without conflicts
 * Crucial for ShadCN components to work properly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}