import { ogImageSize, renderBrandOgImage } from "@/lib/og/brand-image";

export const size = ogImageSize;
export const contentType = "image/png";
export const alt = "Haxio — a support agent that actually does things";

export default function TwitterImage() {
  return renderBrandOgImage();
}
