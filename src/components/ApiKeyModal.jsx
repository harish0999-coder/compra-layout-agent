import { useState } from "react";

export default function ApiKeyModal({ onSubmit }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [testing, setTesting] = useState(false);

  const handleSubmit = async () => {
    if (!key.trim().startsWith("AIza")) {
      setError("Gemini API keys start with 'AIza...' — please check your key.");
      return;
    }
    setTesting(true);
    setError("");
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key.trim()}`
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error?.message || "Invalid key");
      }
      onSubmit(key.trim());
    } catch (err) {
      setError(`Key test failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(8px)",
    }}>
      <div style={{
        background: "#111118", border: "1px solid rgba(124,92,252,0.3)",
        borderRadius: 16, padding: 36, width: 460, maxWidth: "90vw",
        boxShadow: "0 0 60px rgba(124,92,252,0.15)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, #7c5cfc, #f4cf1b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: "#fff",
          }}>C</div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18 }}>
              Compra <span style={{ color: "#a78bfa" }}>Layout Agent</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(240,238,255,0.4)", marginTop: 2 }}>
              Powered by Google Gemini
            </div>
          </div>
        </div>

        <p style={{ fontSize: 13.5, color: "rgba(240,238,255,0.7)", lineHeight: 1.7, marginBottom: 24 }}>
          Enter your free <strong style={{ color: "#fff" }}>Google Gemini API key</strong> to start.
          Your key is stored only in your browser session — never sent to any server.
        </p>

        {/* Steps */}
        <div style={{
          background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.2)",
          borderRadius: 10, padding: "14px 16px", marginBottom: 20, fontSize: 12.5,
          color: "rgba(240,238,255,0.6)", lineHeight: 1.8,
        }}>
          <div style={{ color: "#a78bfa", fontWeight: 600, marginBottom: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 }}>Get a free key in 2 minutes</div>
          <div>1. Go to <strong style={{ color: "#fff" }}>aistudio.google.com</strong></div>
          <div>2. Sign in with Google</div>
          <div>3. Click <strong style={{ color: "#fff" }}>"Get API key" → "Create API key"</strong></div>
          <div>4. Copy the key (starts with <code style={{ color: "#f4cf1b" }}>AIza...</code>)</div>
        </div>

        <input
          type="password"
          placeholder="AIzaSy..."
          value={key}
          onChange={e => { setKey(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{
            width: "100%", padding: "12px 14px",
            background: "#1a1a26", border: `1px solid ${error ? "#FF3333" : "rgba(255,255,255,0.14)"}`,
            borderRadius: 8, color: "#f0eeff", fontSize: 14,
            fontFamily: "'DM Mono',monospace", outline: "none", marginBottom: 8,
          }}
        />

        {error && (
          <div style={{ color: "#FF3333", fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={testing || !key.trim()}
          style={{
            width: "100%", padding: "12px",
            background: testing ? "rgba(124,92,252,0.5)" : "linear-gradient(135deg,#7c5cfc,#5b3ecf)",
            border: "none", borderRadius: 8, color: "#fff",
            fontSize: 14, fontWeight: 600, cursor: testing ? "not-allowed" : "pointer",
            fontFamily: "'Inter',sans-serif", transition: "all 0.15s",
          }}
        >
          {testing ? "Testing key…" : "Start Layout Agent →"}
        </button>

        <p style={{ fontSize: 11, color: "rgba(240,238,255,0.3)", textAlign: "center", marginTop: 14 }}>
          Free tier · No credit card needed · 1500 requests/day
        </p>
      </div>
    </div>
  );
}
