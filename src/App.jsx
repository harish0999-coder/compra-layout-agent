import { useState } from "react";
import { useLayoutAgent } from "./hooks/useLayoutAgent";
import ChatPanel from "./components/ChatPanel";
import WireframePreview from "./components/WireframePreview";
import JSONViewer from "./components/JSONViewer";
import ApiKeyModal from "./components/ApiKeyModal";

const ASPECTS = [
  { label:"1:1",  w:1080, h:1080 },
  { label:"9:16", w:1080, h:1920 },
  { label:"16:9", w:1920, h:1080 },
  { label:"4:5",  w:1080, h:1350 },
];

function getActiveAspect(layout) {
  const a = layout.nodes["artboard_1778485662755_3"];
  const r = a.width / a.height;
  if (Math.abs(r - 1) < 0.05) return "1:1";
  if (r < 0.7) return "9:16";
  if (r > 1.5) return "16:9";
  if (r > 0.75 && r < 0.9) return "4:5";
  return null;
}

function MainApp({ apiKey, onChangeKey }) {
  const { layout, messages, isLoading, lastModifiedId, sendMessage, resetLayout } = useLayoutAgent(apiKey);
  const artboard = layout.nodes["artboard_1778485662755_3"];
  const activeAspect = getActiveAspect(layout);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"400px 1fr", gridTemplateRows:"52px 1fr", height:"100vh" }}>
      {/* HEADER */}
      <header style={{
        gridColumn:"1/-1", display:"flex", alignItems:"center", gap:14,
        padding:"0 20px", background:"var(--surface)", borderBottom:"1px solid var(--border)", zIndex:10,
      }}>
        <div style={{
          width:30, height:30, borderRadius:8,
          background:"linear-gradient(135deg,var(--accent),var(--gold))",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:"#fff",
        }}>C</div>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, letterSpacing:"-0.3px" }}>
          Compra <span style={{ color:"var(--accent2)" }}>Layout Agent</span>
        </span>

        <span style={{
          fontFamily:"'DM Mono',monospace", fontSize:11, color:"var(--muted)", marginLeft:4,
          background:"rgba(255,255,255,0.05)", border:"1px solid var(--border2)",
          padding:"2px 8px", borderRadius:4,
        }}>
          {Math.round(artboard.width)} × {Math.round(artboard.height)}
        </span>

        {/* Aspect ratio buttons */}
        <div style={{ display:"flex", gap:6 }}>
          {ASPECTS.map(({ label, w, h }) => (
            <button key={label} onClick={() => sendMessage(`Convert this design to ${label} (${w}x${h})`)}
              disabled={isLoading}
              style={{
                padding:"4px 10px", borderRadius:6,
                border:`1px solid ${activeAspect===label ? "var(--accent)" : "var(--border2)"}`,
                background: activeAspect===label ? "rgba(124,92,252,0.2)" : "transparent",
                color: activeAspect===label ? "var(--accent2)" : "var(--muted)",
                fontSize:11, fontFamily:"'DM Mono',monospace", cursor:"pointer",
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Status */}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{
            display:"flex", alignItems:"center", gap:6,
            fontSize:11, color:"var(--muted)", fontFamily:"'DM Mono',monospace",
            background:"rgba(124,92,252,0.12)", border:"1px solid rgba(124,92,252,0.25)",
            padding:"3px 10px", borderRadius:20,
          }}>
            <span style={{
              width:6, height:6, borderRadius:"50%", display:"inline-block",
              background: isLoading ? "var(--gold)" : "var(--success)",
              animation:"pulse 2s infinite",
            }} />
            {isLoading ? "Thinking…" : "Gemini 2.0 Flash"}
          </div>
          <button onClick={onChangeKey} style={{
            fontSize:10, fontFamily:"'DM Mono',monospace", background:"transparent",
            border:"1px solid var(--border2)", color:"var(--muted)",
            padding:"4px 10px", borderRadius:6, cursor:"pointer",
          }}>
            Change Key
          </button>
        </div>
      </header>

      {/* CHAT */}
      <div style={{ overflow:"hidden" }}>
        <ChatPanel messages={messages} isLoading={isLoading} onSend={sendMessage} />
      </div>

      {/* RIGHT PANEL */}
      <div style={{ display:"grid", gridTemplateRows:"1fr 1fr", overflow:"hidden" }}>
        {/* Wireframe */}
        <div style={{ background:"var(--bg)", borderBottom:"1px solid var(--border)", display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ padding:"10px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", flexShrink:0 }}>
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:0.8 }}>Wireframe Preview</p>
            <span style={{
              marginLeft:"auto", fontSize:10, fontFamily:"'DM Mono',monospace",
              background:"rgba(244,207,27,0.12)", color:"var(--gold)",
              border:"1px solid rgba(244,207,27,0.25)", padding:"2px 8px", borderRadius:20,
            }}>Live</span>
          </div>
          <WireframePreview layout={layout} lastModifiedId={lastModifiedId} />
        </div>

        {/* JSON */}
        <div style={{ background:"var(--surface)", overflow:"hidden" }}>
          <JSONViewer layout={layout} onReset={resetLayout} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("gemini_key") || "");

  const handleKeySubmit = (key) => {
    sessionStorage.setItem("gemini_key", key);
    setApiKey(key);
  };

  const handleChangeKey = () => {
    sessionStorage.removeItem("gemini_key");
    setApiKey("");
  };

  if (!apiKey) return <ApiKeyModal onSubmit={handleKeySubmit} />;
  return <MainApp apiKey={apiKey} onChangeKey={handleChangeKey} />;
}
