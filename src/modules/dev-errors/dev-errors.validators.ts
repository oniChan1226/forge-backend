import z from "zod";

export const devErrorBodySchema = z.object({
  scenario: z.enum(["bad-request", "unauthorized", "forbidden", "conflict", "unprocessable"]),
  referenceId: z.string().min(3, "Reference ID must be at least 3 characters long"),
  retryable: z.boolean().optional(),
});

export const devErrorQuerySchema = z.object({
  page: z.coerce.number().int("Page must be an integer").positive("Page must be a positive number"),
  filter: z.enum(["all", "active", "inactive"]),
});

export const devErrorParamsSchema = z.object({
  ticketId: z.coerce.number().int("Ticket ID must be an integer").positive("Ticket ID must be a positive number"),
});
