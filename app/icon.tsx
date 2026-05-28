import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 360,
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
