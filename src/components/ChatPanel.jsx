import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  "Convert this design to 9:16",
  "Move the headline to the top",
  "Make the headline smaller",
  "Move the offer badge higher",
  "Make the discount badge bigger",
  "Change the headline color to red",
  "Center the product",
  "Keep the product large",
];

function Dots() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "2px 0" }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%", display: "inline-block",
          background: "var(--accent2)",
          animation: `bounce 1.2s ${i*0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

export default function ChatPanel({ messages, isLoading, onSend }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  const send = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
  };

  const onKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const onInput = e => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", background:"var(--surface)", borderRight:"1px solid var(--border)", height:"100%", overflow:"hidden" }}>
      <div style={{ padding:"14px 18px 10px", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:1 }}>Layout Chat</p>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:12 }}>
        {messages.map((m, i) => (
          <div key={i} className="fade-up" style={{ display:"flex", flexDirection:"column", alignItems: m.role==="user"?"flex-end":"flex-start", gap:3 }}>
            <span style={{ fontSize:10, color:"var(--muted2)", fontFamily:"'DM Mono',monospace", padding:"0 4px" }}>
              {m.role==="user" ? "You" : "Agent"}
            </span>
            <div style={{
              maxWidth:"88%", padding:"10px 14px",
              borderRadius: m.role==="user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: m.role==="user" ? "linear-gradient(135deg,var(--accent),#5b3ecf)" : "var(--surface2)",
              border: m.role==="assistant" ? "1px solid var(--border)" : "none",
              color:"var(--text)", fontSize:13.5, lineHeight:1.6, whiteSpace:"pre-wrap",
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="fade-up" style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:3 }}>
            <span style={{ fontSize:10, color:"var(--muted2)", fontFamily:"'DM Mono',monospace", padding:"0 4px" }}>Agent</span>
            <div style={{ padding:"10px 14px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"14px 14px 14px 4px" }}>
              <Dots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding:"8px 16px 10px", borderTop:"1px solid var(--border)", flexShrink:0 }}>
        <p style={{ fontSize:10, color:"var(--muted2)", marginBottom:8, fontFamily:"'DM Mono',monospace", textTransform:"uppercase", letterSpacing:0.5 }}>Try these</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => onSend(s)} disabled={isLoading} style={{
              padding:"4px 10px", borderRadius:20,
              border:"1px solid var(--border2)", background:"transparent",
              color:"var(--muted)", fontSize:11.5, cursor:"pointer", fontFamily:"'Inter',sans-serif",
              transition:"all 0.15s", whiteSpace:"nowrap",
            }}
            onMouseEnter={e => { e.target.style.background="rgba(124,92,252,0.12)"; e.target.style.color="var(--accent2)"; }}
            onMouseLeave={e => { e.target.style.background="transparent"; e.target.style.color="var(--muted)"; }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"10px 14px", borderTop:"1px solid var(--border)", display:"flex", gap:8, alignItems:"flex-end", flexShrink:0 }}>
        <textarea ref={taRef} value={input} onChange={onInput} onKeyDown={onKey}
          disabled={isLoading} rows={1} placeholder="Describe a layout change…"
          style={{
            flex:1, background:"var(--surface2)", border:"1px solid var(--border2)",
            borderRadius:8, color:"var(--text)", padding:"10px 14px",
            fontSize:13.5, fontFamily:"'Inter',sans-serif",
            resize:"none", outline:"none", lineHeight:1.5, maxHeight:100,
          }}
          onFocus={e => e.target.style.borderColor="rgba(124,92,252,0.5)"}
          onBlur={e => e.target.style.borderColor="var(--border2)"}
        />
        <button onClick={send} disabled={isLoading || !input.trim()} style={{
          width:38, height:38, borderRadius:8, background:"var(--accent)", border:"none",
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          color:"#fff", flexShrink:0, opacity: isLoading || !input.trim() ? 0.4 : 1,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
