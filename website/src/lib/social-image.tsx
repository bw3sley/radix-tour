import { ImageResponse } from "takumi-js/response";
import { OgImage } from "../components/og-image";

export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export const SOCIAL_IMAGE_ALT =
  "radix-tour: a product tour highlights the New order button on a sample dashboard.";

export function createSocialImageResponse() {
  return new ImageResponse(<OgImage />, { ...SOCIAL_IMAGE_SIZE, format: "png" });
}
