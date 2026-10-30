import { createSiteIconResponse } from "../lib/site-icon";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return createSiteIconResponse(size.width);
}
