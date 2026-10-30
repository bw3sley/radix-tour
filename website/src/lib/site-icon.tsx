import { ImageResponse } from "next/og";
import { SpotlightMark } from "../components/spotlight-mark";

export function createSiteIconResponse(size: number) {
  return new ImageResponse(<SpotlightMark size={size} />, { width: size, height: size });
}
