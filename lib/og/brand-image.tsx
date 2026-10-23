import { ImageResponse } from "next/og";

export const ogImageSize = { width: 1200, height: 630 };

export function renderBrandOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0f1a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 160,
            height: 160,
            borderRadius: 40,
            backgroundColor: "#171d2e",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 48,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 38,
              top: 48,
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "11px solid #ffffff",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 78,
              top: 48,
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "11px solid #ff6b2c",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: -1.5,
          }}
        >
          Haxio
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 30,
            color: "#ff6b2c",
            fontWeight: 500,
          }}
        >
          A support agent that actually does things
        </div>
      </div>
    ),
    { ...ogImageSize },
  );
}
