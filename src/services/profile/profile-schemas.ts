import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === "" ? undefined : value));

const optionalAvatarSource = z
  .union([
    z.literal(null),
    optionalText(1000000).refine(
      (value) =>
        !value ||
        value.startsWith("https://") ||
        value.startsWith("http://") ||
        /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(value),
      "Avatar must be an uploaded image or an http(s) URL."
    )
  ])
  .optional();

export const updateProfileSchema = z
  .object({
    fullName: optionalText(100),
    email: z.string().email().max(255).optional().transform((value) => value?.toLowerCase().trim()),
    avatarUrl: optionalAvatarSource,
    currentPassword: optionalText(72),
    newPassword: optionalText(72)
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), "At least one field is required.")
  .refine(
    (value) => !value.newPassword || value.newPassword.length >= 8,
    "New password must be at least 8 characters."
  )
  .refine(
    (value) => !value.newPassword || Boolean(value.currentPassword),
    "Current password is required to change password."
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
