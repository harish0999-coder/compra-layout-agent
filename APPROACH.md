# Approach Note

## Architecture Decision: Pure Frontend (No Backend)

The most important decision was eliminating the backend server entirely. Earlier versions used Node.js + Express to proxy API calls, but this caused `ENOTFOUND` and `ECONNRESET` errors on certain networks. Moving the Gemini API call directly into the browser's `fetch()` solved this completely — browser network stacks handle TLS and DNS differently and more reliably than Node.js in many environments.

The tradeoff is that the API key is visible in the browser session. For a production app, a backend proxy would be the right choice. For this assignment, the browser-direct approach is more robust and simpler.

## How I Structured the LLM Prompt

The system prompt has 5 sections:

1. **JSON schema** — every field explained: `x/y` (absolute pixels), `nx/ny/nw/nh` (normalized 0–1), `fontSizeRatio` (fontSize/artboardWidth, preserved across resizes)
2. **Semantic role map** — hardcoded node ID → design role mapping (e.g. `text_1778486306230_8` = headline). Prevents hallucination on vague instructions like "move the headline"
3. **Transformation rules** — precise math for each operation. Aspect ratio: recompute every child using `x = nx * newWidth`. Text resize: scale `fontSize` and update `fontSizeRatio`
4. **Follow-up context** — `lastModifiedNodeId` passed with every request so "make it bigger" resolves correctly
5. **Output format** — strict JSON with `updatedLayout`, `assistantMessage`, `modifiedNodeId`

## How I Handle JSON Transformations Safely

- All JSON parsing wrapped in try/catch with regex fallback to extract JSON from noisy responses
- `validateLayout()` checks for `rootNodes`, `nodes`, and a valid artboard before updating state
- `responseMimeType: "application/json"` forces Gemini to return pure JSON
- Low temperature (0.1) for deterministic, math-accurate outputs

## How I Maintain Conversation Context

- `historyRef` keeps the last 6 message turns and sends them with every request
- `lastModifiedId` tracked in state, passed to every API call
- System prompt instructs the model to use `lastModifiedNodeId` for pronouns like "it" / "that"

## Trade-offs & What I'd Improve

**Made:**
- No backend → simpler deploy, no proxy issues, but API key visible in session storage
- LLM handles all transformation math → occasionally imprecise; deterministic helpers (`resizeArtboard()`, `moveNode()`) would be more reliable
- Wireframe uses normalized ratios only → fast and robust but no actual image rendering

**With more time:**
- Action-object architecture: LLM returns `{action, params}` → deterministic function executes it
- Undo/redo stack
- Drag-and-drop reposition in wireframe
- PNG export via html2canvas
- Unit tests for each transformation
