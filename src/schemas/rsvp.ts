import { z } from "zod";

export const RSVPBodySchema = z.object({
  token: z.string().min(8, "invalid token"),
  action: z.enum(["attending", "declined"]),
});

export type RSVPBody = z.infer<typeof RSVPBodySchema>;
