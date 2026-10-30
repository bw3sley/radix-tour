import type {} from "takumi-js";
import { SITE_IMAGE_COLORS, SITE_NAME } from "../constants/site";
import { SpotlightMark } from "./spotlight-mark";

export function OgImage() {
  const colors = SITE_IMAGE_COLORS;

  return (
    <div
      tw="relative flex h-full w-full overflow-hidden"
      style={{
        backgroundColor: colors.background,
        color: colors.foreground,
        fontFamily: "sans-serif",
      }}
    >
      <div
        tw="flex items-center"
        style={{
          position: "absolute",
          top: 66,
          left: 70,
          gap: 14,
        }}
      >
        <SpotlightMark size={42} />
        <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>{SITE_NAME}</span>
      </div>

      <div
        tw="flex flex-col"
        style={{
          position: "absolute",
          top: 182,
          left: 70,
          width: 440,
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 74,
            fontWeight: 600,
            lineHeight: 1.04,
            letterSpacing: -4,
          }}
        >
          <span>Guide every</span>
          <span>first step.</span>
        </div>
        <div style={{ width: 390, fontSize: 28, lineHeight: 1.35, color: colors.muted }}>
          Composable product tours for React, built on Radix primitives.
        </div>
      </div>

      <div
        tw="flex items-center"
        style={{
          position: "absolute",
          bottom: 60,
          left: 70,
          gap: 10,
          fontSize: 18,
          color: colors.subtle,
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }} />
        Built on Radix · unstyled
      </div>

      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 112,
          left: 560,
          width: 584,
          height: 390,
          overflow: "hidden",
          border: `1px solid ${colors.border}`,
          borderRadius: 20,
          backgroundColor: colors.card,
          boxShadow: "0 24px 60px rgba(24, 24, 27, 0.13)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 143,
            flexDirection: "column",
            gap: 19,
            padding: "22px 14px",
            borderRight: `1px solid ${colors.border}`,
            backgroundColor: "#faf9f7",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700 }}>Crumb &amp; Co.</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 7,
              fontSize: 13,
              color: colors.muted,
            }}
          >
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 7,
                backgroundColor: colors.card,
                color: colors.foreground,
              }}
            >
              Orders
            </div>
            <div style={{ padding: "8px 10px" }}>Products</div>
            <div style={{ padding: "8px 10px" }}>Customers</div>
            <div style={{ padding: "8px 10px" }}>Deliveries</div>
          </div>
        </div>

        <div style={{ display: "flex", width: 440, flexDirection: "column", gap: 20, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div
              style={{
                width: 174,
                padding: "9px 12px",
                border: `1px solid ${colors.border}`,
                borderRadius: 7,
                fontSize: 12,
                color: colors.subtle,
              }}
            >
              Search orders...
            </div>
            <div
              style={{
                padding: "9px 12px",
                borderRadius: 7,
                backgroundColor: colors.foreground,
                fontSize: 12,
                fontWeight: 700,
                color: colors.card,
              }}
            >
              + New order
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            <div style={{ fontSize: 25, fontWeight: 700 }}>Orders</div>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                gap: 6,
                padding: 5,
                borderRadius: 8,
                backgroundColor: "#f5f4f1",
                fontSize: 12,
                color: colors.muted,
              }}
            >
              <span
                style={{
                  padding: "5px 8px",
                  borderRadius: 5,
                  backgroundColor: colors.card,
                  color: colors.foreground,
                }}
              >
                All 24
              </span>
              <span style={{ padding: "5px 8px" }}>Baking 6</span>
              <span style={{ padding: "5px 8px" }}>Ready 9</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", fontSize: 12 }}>
            {["Lúcia Ferreira", "Kofi Mensah", "Hana Sato"].map((name, index) => (
              <div
                key={name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <span style={{ color: colors.subtle }}>#{1042 - index}</span>
                <span>{name}</span>
                <span style={{ color: colors.muted }}>{index === 0 ? "Baking" : "Ready"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 124,
          right: 63,
          width: 122,
          height: 52,
          border: `3px solid ${colors.accent}`,
          borderRadius: 12,
        }}
      />

      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 338,
          right: 44,
          width: 332,
          flexDirection: "column",
          gap: 13,
          padding: 25,
          borderRadius: 16,
          backgroundColor: colors.foreground,
          boxShadow: "0 18px 44px rgba(24, 24, 27, 0.24)",
          color: colors.card,
        }}
      >
        <div style={{ fontSize: 21, fontWeight: 700 }}>Add an order</div>
        <div style={{ fontSize: 15, lineHeight: 1.35, color: colors.darkMuted }}>
          Standing orders repeat every week.
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          <span style={{ fontSize: 13, color: colors.darkMuted }}>4 of 4</span>
          <span
            style={{
              padding: "8px 15px",
              borderRadius: 6,
              backgroundColor: colors.card,
              color: colors.foreground,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Done
          </span>
        </div>
      </div>
    </div>
  );
}
