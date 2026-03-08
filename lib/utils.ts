import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Funcion para obtener la url de la imagen con timestamp para evitar cache
export const getImageUrlWithTimestamp = (url: string | null) => {
    if (!url) return '';
    const timestamp = new Date().getTime();
    return `${url}?t=${timestamp}`;
}