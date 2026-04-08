import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Codify — Your 30 Years of Expertise, Compounding Forever.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
          padding: "60px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #6366f1, #a855f7, #6366f1)",
          }}
        />

        {/* Brand */}
        <div
          style={{
            display: "flex",
            fontSize: "32px",
            fontWeight: 700,
            color: "#a855f7",
            letterSpacing: "-0.02em",
            marginBottom: "32px",
            textTransform: "lowercase",
          }}
        >
          codify.build
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            fontSize: "64px",
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "24px",
          }}
        >
          {"Your AI Doesn't Know Your Business."}
        </div>

        {/* Subhead */}
        <div
          style={{
            display: "flex",
            fontSize: "26px",
            fontWeight: 400,
            color: "#a1a1aa",
            textAlign: "center",
            lineHeight: 1.4,
            maxWidth: "800px",
          }}
        >
          We extract your expertise and structure it so AI actually sells like you do.
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            fontSize: "18px",
            color: "#71717a",
          }}
        >
          Your expertise, structured. Your AI, transformed.
        </div>
      </div>
    ),
    { ...size }
  );
}
