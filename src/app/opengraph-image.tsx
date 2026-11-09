import { ImageResponse } from "next/og";
import { LOGO_H, LOGO_PATH, LOGO_W } from "@/components/logo-path";
import { site } from "@/content/site";
import { getSettings } from "@/lib/content";

export const alt = `${site.person} (ANX), video editor`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const { totalViews } = await getSettings();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 85% 90%, #0b3640 0%, #00090f 55%)",
          color: "#ffffff",
        }}
      >
        <svg width={360} height={(360 * LOGO_H) / LOGO_W} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`}>
          <path fill="#fdf0ec" fillRule="evenodd" d={LOGO_PATH} />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2, display: "flex" }}>
            Every frame earns the&nbsp;<span style={{ color: "#00f57a" }}>next.</span>
          </div>
          <div style={{ fontSize: 32, marginTop: 20, color: "#b8c5cc", display: "flex" }}>
            {`${site.person}, video editor.${totalViews ? ` ${totalViews} views across Instagram.` : ""}`}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
