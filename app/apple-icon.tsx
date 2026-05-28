import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#18181b",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 130,
          fontWeight: 800,
          letterSpacing: "-0.06em",
          fontFamily: "system-ui",
        }}
      >
        i
      </div>
    ),
    { ...size },
  );
}
