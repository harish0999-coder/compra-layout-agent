import { useState, useEffect, useRef } from "react";

function highlight(json) {
  return JSON.stringify(json, null, 2).replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    m => {
      let s = "color:#ff9e64";
      if (/^"/.test(m)) s = /:$/.test(m) ? "color:#7aa2f7" : "color:#9ece6a";
      else if (/true|false/.test(m)) s = "color:#bb9af7";
      else if (/null/.test(m)) s = "color:#f7768e";
      return `<span style="${s}">${m}</span>`;
    }
  );
}

export default function JSONViewer({ layout, onReset }) {
  const [flash, setFlash] = useState(false);
  const [copied, setCopied] = useState(false);
  const prevRef = useRef(null);

  useEffect(() => {
    if (prevRef.current && JSON.stringify(prevRef.current) !== JSON.stringify(layout)) {
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    }
    prevRef.current = layout;
  }, [layout]);

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(layout, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const btn = { fontSize:10, fontFamily:"'DM Mono',monospace", background:"transparent", border:"1px solid var(--border2)", color:"var(--muted)", padding:"3px 10px", borderRadius:4, cursor:"pointer" };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      <div style={{ padding:"10px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:0.8 }}>Layout JSON</p>
        <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
          <button onClick={copy} style={btn}>{copied ? "Copied!" : "Copy JSON"}</button>
          <button onClick={onReset} style={btn}>Reset</button>
        </div>
      </div>
      <div
        style={{ flex:1, overflowY:"auto", overflowX:"auto", padding:"14px 16px", fontFamily:"'DM Mono',monospace", fontSize:11.5, lineHeight:1.7, color:"#a9b1d6", transition:"background 0.3s", background: flash ? "rgba(16,185,129,0.05)" : "transparent" }}
        dangerouslySetInnerHTML={{ __html: `<pre>${highlight(layout)}</pre>` }}
      />
    </div>
  );
}
