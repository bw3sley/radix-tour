import { SITE_IMAGE_COLORS } from "../constants/site";

export function SpotlightMark({ size }: { size: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
        backgroundColor: SITE_IMAGE_COLORS.foreground,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: Math.round(size * 0.6),
          height: Math.round(size * 0.6),
          borderRadius: Math.round(size * 0.15),
          backgroundColor: SITE_IMAGE_COLORS.card,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: Math.round(size * 0.39),
            height: Math.round(size * 0.39),
            borderRadius: Math.round(size * 0.08),
            backgroundColor: SITE_IMAGE_COLORS.foreground,
          }}
        >
          <div
            style={{
              width: Math.round(size * 0.17),
              height: Math.round(size * 0.17),
              borderRadius: Math.round(size * 0.09),
              backgroundColor: SITE_IMAGE_COLORS.accent,
            }}
          />
        </div>
      </div>
    </div>
  );
}
