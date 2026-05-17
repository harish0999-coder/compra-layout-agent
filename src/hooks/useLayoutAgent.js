import { useState, useRef, useCallback } from "react";
import initialLayout from "../data/initialLayout.json";

const SYSTEM_PROMPT = `You are a professional layout transformation agent for a design tool called Compra. You receive a design layout JSON and a user instruction, then return the updated layout JSON with the transformation applied.

LAYOUT JSON STRUCTURE:
- rootNodes: array of artboard IDs
- nodes: object keyed by node ID, each node has:
  - id, name, type (image/text/shape/artboard), parentId
  - x, y: absolute pixel position on artboard
  - width, height: absolute pixel dimensions
  - nx, ny: normalized position (0-1) relative to artboard width/height
  - nw, nh: normalized size (0-1) relative to artboard width/height
  - data: content (text string, imageUrl, shapeType)
  - style.visual: color, fontSize, fontWeight, fontStyle, fill, stroke, borderRadius
  - fontSizeRatio: fontSize / artboard.width (preserve this when resizing)
  - For artboard: children array, data.backgroundColor

SEMANTIC ROLES:
- "Background.png" -> full-bleed background image (img_1778485681535_4)
- "Product.png" -> main product image (img_1778489515746_17)
- "Luxury Comfort..." text -> headline (text_1778486306230_8)
- "Comfort that defines modern living" -> subheadline (text_1778486136643_7)
- "Limited time offer" -> offer badge text (text_1778486004640_6)
- "20%\\nOFF" -> discount badge text (text_1778489078397_16)
- "Circle" shape -> discount badge background (circle_1778488914968_15)
- "Over 8,000 happy homes" -> social proof (text_1778486552508_9)

TRANSFORMATION RULES:

1. ASPECT RATIO CONVERSION:
   - Update artboard width and height
   - For EVERY child: x=nx*newW, y=ny*newH, width=nw*newW, height=nh*newH
   - Text nodes: fontSize=fontSizeRatio*newW
   - Background: x=0,y=0,width=newW,height=newH,nx=0,ny=0,nw=1,nh=1
   - Sizes: 1:1=1080x1080, 9:16=1080x1920, 16:9=1920x1080, 4:5=1080x1350

2. MOVING:
   - "to top": ny=0.02, y=0.02*artH
   - "higher": ny-=0.08, y=ny*artH
   - "lower": ny+=0.08, y=ny*artH
   - "center": nx=0.5-nw/2, x=nx*artW
   - Always update both absolute AND normalized coords

3. RESIZING:
   - "smaller": nw*=0.75, nh*=0.75, recalc width/height
   - "bigger": nw*=1.35, nh*=1.35, recalc width/height
   - Text: scale fontSize too, update fontSizeRatio=fontSize/artW

4. COLOR: style.visual.color.value for text, style.visual.fill.value for shapes
   red=#FF3333, blue=#3B82F6, green=#22C55E, yellow=#EAB308, white=#FFFFFF,
   black=#111111, orange=#F97316, purple=#7C3AED, pink=#EC4899

5. FOLLOW-UP: "it"/"that" -> lastModifiedNodeId

RESPOND WITH ONLY RAW JSON. No markdown. No code fences. No extra text.
{"updatedLayout":{...complete layout...},"assistantMessage":"one sentence","modifiedNodeId":"id"}`;

function validateLayout(layout) {
  if (!layout?.rootNodes || !layout?.nodes) return false;
  const ab = layout.nodes["artboard_1778485662755_3"];
  return ab && ab.width && ab.height;
}

export function useLayoutAgent(apiKey) {
  const [layout, setLayout] = useState(() => JSON.parse(JSON.stringify(initialLayout)));
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm your layout agent. I can transform the design — try converting to 9:16, moving the headline, changing colors, or resizing elements!",
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastModifiedId, setLastModifiedId] = useState(null);
  const historyRef = useRef([]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    historyRef.current.push(userMsg);
    setIsLoading(true);

    try {
      const userContent = `User instruction: "${text}"
Last modified node ID: ${lastModifiedId || "none"}
Current layout JSON:
${JSON.stringify(layout)}`;

      // Build Gemini contents array
      const contents = [];
      // Add history (Gemini uses user/model alternating)
      historyRef.current.slice(-6, -1).forEach((m, i) => {
        contents.push({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        });
      });
      contents.push({ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + userContent }] });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 8192,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!raw) throw new Error("Empty response from Gemini");

      let parsed;
      try {
        parsed = JSON.parse(raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
        else throw new Error("Could not parse response as JSON");
      }

      if (!validateLayout(parsed.updatedLayout)) {
        throw new Error("Model returned invalid layout structure. Please try again.");
      }

      setLayout(parsed.updatedLayout);
      setLastModifiedId(parsed.modifiedNodeId || null);

      const assistantMsg = { role: "assistant", content: parsed.assistantMessage || "Layout updated!" };
      setMessages(prev => [...prev, assistantMsg]);
      historyRef.current.push(assistantMsg);

    } catch (err) {
      const errMsg = { role: "assistant", content: `❌ ${err.message}` };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [layout, isLoading, lastModifiedId, apiKey]);

  const resetLayout = useCallback(() => {
    setLayout(JSON.parse(JSON.stringify(initialLayout)));
    setLastModifiedId(null);
    historyRef.current = [];
    setMessages([{ role: "assistant", content: "Layout reset! What would you like to change?" }]);
  }, []);

  return { layout, messages, isLoading, lastModifiedId, sendMessage, resetLayout };
}
