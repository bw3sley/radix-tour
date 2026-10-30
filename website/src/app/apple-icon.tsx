import { createSiteIconResponse } from "../lib/site-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return createSiteIconResponse(size.width);
}
