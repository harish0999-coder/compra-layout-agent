import { useRef } from "react";

const NODE_CONFIG = {
  "Background.png": { bg: "rgba(100,90,160,0.35)", border: "rgba(124,92,252,0.3)", label: "Background", color: "#a78bfa" },
  "Product.png":    { bg: "rgba(16,185,129,0.18)",  border: "rgba(16,185,129,0.5)",  label: "Product",    color: "#34d399" },
};

export default function WireframePreview({ layout, lastModifiedId }) {
  const containerRef = useRef(null);
  const artboard = layout.nodes["artboard_1778485662755_3"];
  const aw = artboard.width;
  const ah = artboard.height;

  const getScale = () => {
    if (!containerRef.current) return 0.28;
    const cw = containerRef.current.clientWidth - 32;
    const ch = containerRef.current.clientHeight - 32;
    return Math.min(cw / aw, ch / ah);
  };

  const scale = getScale();
  const dw = Math.round(aw * scale);
  const dh = Math.round(ah * scale);
  const children = artboard.children || [];

  return (
    <div ref={containerRef} style={{ flex:1, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{
        position:"relative", width:dw, height:dh, flexShrink:0,
        border:"1px solid var(--border2)", background:"#1a1a28",
        boxShadow:"0 0 0 1px rgba(124,92,252,0.1), 0 20px 60px rgba(0,0,0,0.5)",
        transition:"all 0.4s cubic-bezier(0.34,1.56,0.64,1)", overflow:"hidden",
      }}>
        {children.map(nid => {
          const node = layout.nodes[nid];
          if (!node || node.type === "artboard") return null;
          const isHighlighted = nid === lastModifiedId;
          const left   = node.nx * dw;
          const top    = node.ny * dh;
          const width  = node.nw * dw;
          const height = node.nh * dh;

          const base = {
            position:"absolute", left, top, width, height,
            display:"flex", alignItems:"center", justifyContent:"center",
            overflow:"hidden", transition:"all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            outline: isHighlighted ? "2px solid rgba(124,92,252,0.9)" : "none",
            outlineOffset: 2,
          };

          if (node.type === "shape" && node.data?.shapeType === "circle") {
            const fill = node.style?.visual?.fill?.value || "#F4CF1B";
            return <div key={nid} style={{ ...base, borderRadius:"50%", background:fill+"40", border:`2px solid ${fill}` }} />;
          }

          if (node.type === "image") {
            const cfg = NODE_CONFIG[node.name] || { bg:"rgba(80,80,120,0.25)", border:"rgba(120,120,200,0.3)", label:node.name?.replace(".png","") || "Image", color:"#888" };
            return (
              <div key={nid} style={{ ...base, background:cfg.bg, border:`1px solid ${cfg.border}` }}>
                <span style={{ fontSize:Math.max(7,Math.min(11,width*0.12)), color:cfg.color, fontWeight:500, textAlign:"center", padding:2, lineHeight:1.2 }}>
                  {cfg.label}
                </span>
              </div>
            );
          }

          if (node.type === "text") {
            const clr = node.style?.visual?.color?.value;
            const textColor = (!clr || clr === "#FFFF" || clr === "#FFFFFF") ? "rgba(255,255,255,0.9)" : clr;
            const fs = Math.max(7, Math.min((node.fontSizeRatio || 0.044) * dw, 20));
            return (
              <div key={nid} style={{ ...base, border: isHighlighted ? "1px dashed rgba(124,92,252,0.8)" : "1px dashed rgba(255,255,255,0.15)", background:"transparent" }}>
                <span style={{
                  fontSize:fs, color:textColor,
                  fontWeight:node.style?.visual?.fontWeight || 500,
                  fontStyle:node.style?.visual?.fontStyle || "normal",
                  textAlign:"center", padding:2, lineHeight:1.2,
                  whiteSpace:"pre-wrap", overflow:"hidden",
                }}>
                  {node.data?.content || node.name}
                </span>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
