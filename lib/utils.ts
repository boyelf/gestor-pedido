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

export const CATEGORIAS = [
  { id: '1b197943-585e-4d81-bbd4-370e97a9f373', label: 'AGUA_BOTELLON' },
  { id: '21f20dfa-50b1-4aa3-b213-a93618e11f82', label: 'ALCOHOL' },
  { id: 'c0ebc5ef-2010-41d6-8d27-058fe6be6826', label: 'COMESTIBLES' },
  { id: '6609f97a-040a-4551-a716-78f0798db854', label: 'DETERGENTES' },
  { id: 'ca1515e3-9605-4395-8e55-249a16bf76ad', label: 'OTROS' },
  { id: 'febf225a-f6e4-4702-ae16-89c60488f031', label: 'PRODUCTOS_FRESCOS' },
  { id: 'dafe5a82-7ac6-4716-a412-046c3259d79e', label: 'REFRESCOS' }
]