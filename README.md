# Compra Layout Agent

A chat-based AI layout agent built for the Compra AI Engineer Internship. Chat with an AI to transform design layouts in real time — convert aspect ratios, reposition elements, resize text, change colors, and more.

## Architecture

**Pure frontend — no backend server needed.** The app calls the Google Gemini API directly from the browser, eliminating network proxy issues entirely.

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + CSS variables |
| LLM | Google Gemini 2.0 Flash (via browser fetch) |
| State | React useState + custom hook |
| Preview | Absolute-positioned divs using normalized coords |

## Prerequisites

- Node.js v18+
- A free Google Gemini API key from [aistudio.google.com](https://aistudio.google.com)

## Setup

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/compra-layout-agent.git
cd compra-layout-agent

# 2. Install
npm install

# 3. Run
npm run dev
```

Open **http://localhost:5173** — you'll be prompted to enter your Gemini API key.

## Getting a Free Gemini API Key

1. Go to **aistudio.google.com**
2. Sign in with Google
3. Click **"Get API key" → "Create API key"**
4. Copy the key (starts with `AIza...`)
5. Paste it into the app's key prompt

Free tier: 1,500 requests/day, no credit card needed.

## Example Prompts

| Prompt | Result |
|---|---|
| `Convert this design to 9:16` | Artboard → 1080×1920, all elements reposition |
| `Move the headline to the top` | Headline moves to top of canvas |
| `Make the headline smaller` | Font size + bounding box scale down |
| `Move the offer badge higher` | Badge moves up |
| `Make the discount badge bigger` | Circle + text scale up |
| `Change the headline color to red` | Headline color → #FF3333 |
| `Center the product` | Product centers horizontally |
| *(follow-up)* `make it bigger` | Understood from conversation context |

## Project Structure

```
compra-layout-agent/
├── src/
│   ├── components/
│   │   ├── ApiKeyModal.jsx      # Key entry screen with validation
│   │   ├── ChatPanel.jsx        # Chat UI with suggestions
│   │   ├── WireframePreview.jsx # Live animated canvas preview
│   │   └── JSONViewer.jsx       # Syntax-highlighted JSON viewer
│   ├── hooks/
│   │   └── useLayoutAgent.js    # Gemini API calls + state
│   ├── data/
│   │   └── initialLayout.json   # The provided design JSON
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── APPROACH.md
└── README.md
```

## Deploy to Vercel

```bash
npm run build
# Push to GitHub, connect repo on vercel.com
# No env vars needed — users bring their own key
```
