# 🚀 AR Smart Business Card with AI Avatar Agent

## 📌 Overview

This project is a **WebAR-based Smart Business Card** that uses augmented reality to display an interactive digital experience when a user scans a QR code.

Instead of a traditional business card, users can:
- View a 3D AR business card
- See an AI avatar walking and speaking
- Interact with social/contact buttons
- Experience immersive storytelling

---

## 🎯 Features

### Core Features
- 📷 Marker-based WebAR (no app required)
- 🪪 Digital business card overlay
- 🤖 AI avatar with animation
- 🗣️ Voice narration using TTS
- 🔘 Clickable CTA buttons:
  - WhatsApp / Call
  - Facebook
  - Instagram
  - Website / LinkedIn

### Advanced Features (Optional)
- Lip-sync animation
- Real-time AI chatbot avatar
- Analytics tracking (user scans)
- Multi-template system (future SaaS)

---

## 🧠 Tech Stack

### Frontend
- React.js
- Three.js
- React Three Fiber (R3F)
- Tailwind CSS

### AR Engine
- MindAR.js (Image Target Tracking)

### AI + Voice
- ElevenLabs API (Text-to-Speech)

### 3D Assets
- Ready Player Me (Avatar)
- Mixamo (Animations)

### Deployment
- Vercel / Netlify (Frontend)
- AWS S3 / CDN (Assets)

---

## 🏗️ Architecture


User scans QR
↓
WebAR page opens (HTTPS required)
↓
MindAR detects business card marker
↓
Three.js renders AR scene
↓
Avatar loads + animation starts
↓
Voice plays (ElevenLabs)
↓
UI buttons allow interaction


---

## 📁 Project Structure


ar-business-card/
│
├── public/
│ ├── targets/ # MindAR image targets
│ ├── models/ # 3D models (.glb)
│ ├── audio/ # Generated voice files
│
├── src/
│ ├── components/
│ │ ├── ARScene.jsx
│ │ ├── Avatar.jsx
│ │ ├── UIOverlay.jsx
│ │
│ ├── hooks/
│ │ ├── useAR.js
│ │
│ ├── utils/
│ │ ├── voice.js
│ │
│ ├── App.jsx
│ ├── main.jsx
│
├── package.json
└── README.md


---

## ⚙️ Setup Instructions

### 1. Clone Repo

```bash
git clone <your-repo>
cd ar-business-card
2. Install Dependencies
npm install
3. Install Required Libraries
npm install three @react-three/fiber @react-three/drei
npm install mind-ar
4. Run Development Server
npm run dev
📷 AR Setup (MindAR)
Step 1: Create Target Image
Use your business card image
Convert it into .mind file using MindAR compiler
Step 2: Load in Project
const mindarThree = new MindARThree({
  container: containerRef.current,
  imageTargetSrc: "/targets/card.mind"
});
🎨 3D Scene Setup
Basic Scene
const geometry = new THREE.PlaneGeometry(1, 0.6);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
const plane = new THREE.Mesh(geometry, material);
anchor.add(plane);
🤖 Avatar Integration
Steps:
Download avatar from Ready Player Me
Upload .glb to /public/models
Load using Three.js
import { useGLTF } from "@react-three/drei";

const Avatar = () => {
  const { scene } = useGLTF("/models/avatar.glb");
  return <primitive object={scene} scale={0.5} />;
};
🎬 Animation (Mixamo)
Upload avatar to Mixamo
Apply walking animation
Export .glb
Replace model file
🔊 Voice Integration (ElevenLabs)
Generate Voice
export const generateVoice = async (text) => {
  const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech", {
    method: "POST",
    headers: {
      "xi-api-key": process.env.VITE_ELEVENLABS_KEY
    },
    body: JSON.stringify({ text })
  });

  return await response.blob();
};
Play Audio
const audio = new Audio(URL.createObjectURL(blob));
audio.play();
🧾 Script (Avatar Speech)
We specialize in immersive AR and VR–based technologies...
...
For more details or a live product demo, feel free to contact me.
🔘 UI Overlay Buttons
window.open("https://www.facebook.com/profile.php?id=61587031846952");
window.open("https://www.instagram.com/thryvostech_solutions/");
window.open("tel:9141301485");
window.open("https://wa.me/919141301485");
⏳ Loading Screen
<div className="loading">
  Please wait until the scene is loaded
</div>