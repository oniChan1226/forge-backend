export const normalizeText = (value: string): string => value.trim().toLowerCase();

export const normalizePhone = (phone: string): string => phone.replace(/\D+/g, "");

export const normalizeWhitespace = (value: string): string => value.trim().replace(/\s+/g, " ");
