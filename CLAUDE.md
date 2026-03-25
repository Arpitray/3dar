# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WebAR-based Smart Business Card using MindAR image target tracking with Three.js. Users scan a QR code to launch an AR experience featuring a 3D rotating cube with clickable social media logos.

## Commands

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Production build to /dist
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

### Two Operating Modes

The app operates in **demo mode** (default) or **AR mode** (`?mode=ar`):
- **Demo mode**: Simple 3D cube without camera/AR, no HTTPS required
- **AR mode**: Full MindAR image tracking, requires HTTPS and `/targets/card.mind` marker file

Mode switching is available via button in the UI, and can be forced via URL parameter.

### AR Requirements

AR mode requires:
- HTTPS connection (or localhost)
- Camera permissions
- Marker file at `public/targets/card.mind`
- To create/replace marker: https://hiukim.github.io/mind-ar-js/tools/compile

### Key Files

| File | Purpose |
|------|---------|
| `src/components/ARScene.jsx` | Master scene orchestrator; initializes Three.js/MindAR, handles mode switching, passes AR context to child components |
| `src/components/SocialMedia3D.jsx` | 3D social logo boxes in AR space. **Not a rendered React component** — modifies the Three.js scene directly via the anchor ref passed from ARScene |
| `src/config/SocialMediaConfig.js` | Social platform config (URLs, colors, handles) for both 3D logos and UIOverlay |
| `src/components/UIOverlay.jsx` | Demo mode HTML overlay with clickable social links |
| `src/hooks/useAR.js` | Placeholder hook (not currently used in ARScene) |

### SocialMedia3D Component Pattern

This component is mounted conditionally by ARScene after marker tracking begins. It does NOT use React's render tree — instead:
1. Receives `anchor`, `renderer`, `scene`, `camera` from ARScene
2. Creates Three.js meshes directly on the anchor group
3. Runs its own animation loop for pop-in effects
4. Attaches click/touch listeners to the renderer.domElement for raycasting

### MindAR Integration

MindAR is imported directly (not React Three Fiber):
```js
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
```

The AR context (anchor, renderer, scene, camera) is stored in a ref and passed to SocialMedia3D once tracking is active. This allows SocialMedia3D to attach meshes to the anchor group and use raycasting for interaction.

### Vite Configuration

Vite is configured with:
- Host binding to `[::]` for mobile device access on LAN
- COOP/COEP headers required for WebXR/AR
- Ngrok-free.dev domains allowed for mobile tunneling
- Camera and microphone permissions policy headers

## Configuration

Edit `src/config/SocialMediaConfig.js` to update social media links and handles. The same config is used by both the demo UI overlay and the 3D AR logos.
