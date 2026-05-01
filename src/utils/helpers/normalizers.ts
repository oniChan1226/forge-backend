import { ApiError } from "../errors/api-error";

export const normalizeText = (value: string): string => value.trim().toLowerCase();

export const normalizePhone = (phone: string): string => phone.replace(/\D+/g, "");

export const normalizeWhitespace = (value: string): string => value.trim().replace(/\s+/g, " ");

export const requireValue = (
  value: string | undefined | null,
  message: string = "Value is required",
): string => {
  if (!value || value.trim() === "") {
    throw new ApiError(400, message);
  }
  return value;
};
