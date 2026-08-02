import { ImageResponse } from "next/og";

export const alt = "Ottawa Burger Spot — two friends, one baseline burger";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#f4ead4", color: "#211d18", border: "24px solid #211d18", fontFamily: "sans-serif" }}><div style={{ display: "flex", color: "#d83a25", fontSize: 28, fontWeight: 800, letterSpacing: 4 }}>OTTAWA · INDEPENDENT FIELD NOTES</div><div style={{ display: "flex", flexDirection: "column", fontSize: 92, fontWeight: 900, lineHeight: .92, textTransform: "uppercase" }}><span>Ottawa Burger</span><span style={{ color: "#d83a25" }}>Spot.</span></div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 30 }}><span>Two friends. One baseline burger.</span><span style={{ display: "flex", padding: "16px 22px", background: "#f1b92f", border: "4px solid #211d18", fontWeight: 800 }}>OTTAWABURGERSPOT.COM</span></div></div>, size);
}
